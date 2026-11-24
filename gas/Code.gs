/**
 * =================================================================
 * 夫婦の家計簿アプリ (ふたり家計簿) - Google Apps Script (GAS) コード v2
 * ※ 月別精算済みフラグ（精算管理シート）同期対応版
 * =================================================================
 * 
 * 【初回設定手順】
 * 1. 新しいGoogleスプレッドシートを作成し、名前を「ふたり家計簿データ」等にします。
 * 2. 上部メニュー [拡張機能] -> [Apps Script] を開きます。
 * 3. このコードをすべて貼り付けて保存（Ctrl+S / Cmd+S）します。
 * 4. 右上の [デプロイ] -> [新しいデプロイ] を選択します。
 * 5. 種類: [Web アプリ] を選択。
 * 6. 実行するユーザー: 「自分」 / アクセスできるユーザー: 「全員 (Anyone)」
 * 
 * 【すでに運用中のGASを更新する手順（URLを変えずに更新できます）】
 * 1. Apps Scriptを開き、このコードで全上書きして保存します。
 * 2. 右上の [デプロイ] -> [デプロイを管理] をクリックします。
 * 3. 鉛筆マーク（編集）を押し、バージョンを「新バージョン」にして [デプロイ] を押します。
 */

const SHEET_NAME = '支出データ';
const SETTLEMENT_SHEET_NAME = '精算管理';

// 支出データシートの初期ヘッダー設定
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'ID',
      '日付',
      '金額',
      'カテゴリ',
      '支払者',
      'しんた負担割合',
      'メモ',
      '登録日時'
    ]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#F1F5F9');
  }
  return sheet;
}

// 精算管理シートの初期ヘッダー設定
function setupSettlementSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SETTLEMENT_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SETTLEMENT_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['年月', '精算済み', '精算日']);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#ECFDF5');
  }
  return sheet;
}

// 精算管理シートから精算マップを読み込むヘルパー
function readSettlementsMap() {
  const sheet = setupSettlementSheet();
  const data = sheet.getDataRange().getValues();
  const settlements = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    let ymStr = row[0];
    if (row[0] instanceof Date) {
      ymStr = Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'yyyy-MM');
    } else {
      ymStr = String(row[0]).trim();
    }

    const isSettled = row[1] === true || String(row[1]).toUpperCase() === 'TRUE';

    let settledAt = '';
    if (row[2] instanceof Date) {
      settledAt = Utilities.formatDate(row[2], Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } else if (row[2]) {
      settledAt = String(row[2]).trim();
    }

    settlements[ymStr] = {
      yearMonth: ymStr,
      isSettled: isSettled,
      settledAt: settledAt || undefined
    };
  }

  return settlements;
}

// 精算マップを精算管理シートに一括書き込むヘルパー
function writeSettlementsMap(settlements) {
  const sheet = setupSettlementSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
  }

  const keys = Object.keys(settlements || {}).sort();
  if (keys.length === 0) return;

  const rows = keys.map(function (ym) {
    const record = settlements[ym];
    return [
      String(ym),
      Boolean(record && record.isSettled),
      record && record.settledAt ? String(record.settledAt) : ''
    ];
  });

  // 年月と精算日が勝手に日付型に変換されないようテキスト書式を設定
  sheet.getRange(2, 1, rows.length, 1).setNumberFormat('@');
  sheet.getRange(2, 3, rows.length, 1).setNumberFormat('@');
  sheet.getRange(2, 1, rows.length, 3).setValues(rows);
}

/**
 * データ取得 (GET リクエスト)
 */
function doGet(e) {
  try {
    const sheet = setupSheet();
    const data = sheet.getDataRange().getValues();
    const settlements = readSettlementsMap();
    
    if (data.length <= 1) {
      return createJsonResponse({ status: 'success', data: [], settlements: settlements });
    }

    // ヘッダーを除いたデータ行をJSON形式に変換
    const expenses = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // IDが空の行はスキップ
      
      // 日付のフォーマット (YYYY-MM-DD)
      let dateStr = row[1];
      if (row[1] instanceof Date) {
        dateStr = Utilities.formatDate(row[1], Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }

      const husbandRatio = row[5] !== '' && row[5] !== null && row[5] !== undefined
        ? Number(row[5])
        : 50;

      expenses.push({
        id: String(row[0]),
        date: String(dateStr),
        amount: Number(row[2]) || 0,
        category: String(row[3] || '食費'),
        payer: String(row[4] || 'husband'), // 'husband'=しんた, 'wife'=ともこ
        ratio: {
          husband: husbandRatio,
          wife: 100 - husbandRatio
        },
        memo: String(row[6] || ''),
        createdAt: row[7] ? new Date(row[7]).getTime() : Date.now()
      });
    }

    return createJsonResponse({
      status: 'success',
      data: expenses,
      settlements: settlements
    });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * データ追加・更新・削除・精算ステータス同期 (POST リクエスト)
 */
function doPost(e) {
  try {
    const sheet = setupSheet();
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action; // 'create', 'delete', 'sync_all', 'sync_settlements'

    if (action === 'sync_settlements') {
      writeSettlementsMap(contents.settlements || {});
      return createJsonResponse({ status: 'success', message: 'Synced settlements' });
    }

    if (action === 'sync_all') {
      // 全件一括置換（全データ更新）
      const expenses = contents.expenses || [];
      
      // ヘッダーを残してデータ部分を全削除
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 8).clearContent();
      }

      if (expenses.length > 0) {
        const rows = expenses.map(function (item) {
          return [
            item.id,
            item.date,
            item.amount,
            item.category,
            item.payer,
            item.ratio && item.ratio.husband !== undefined ? item.ratio.husband : 50,
            item.memo || '',
            new Date()
          ];
        });
        sheet.getRange(2, 1, rows.length, 8).setValues(rows);
      }

      // 精算ステータスも含まれていれば同時に同期
      if (contents.settlements && typeof contents.settlements === 'object') {
        writeSettlementsMap(contents.settlements);
      }

      return createJsonResponse({ status: 'success', message: 'Synced all expenses' });
    }

    if (action === 'create' || action === 'add') {
      // 1件追加
      const item = contents.expense;
      sheet.appendRow([
        item.id,
        item.date,
        item.amount,
        item.category,
        item.payer,
        item.ratio && item.ratio.husband !== undefined ? item.ratio.husband : 50,
        item.memo || '',
        new Date()
      ]);
      return createJsonResponse({ status: 'success', message: 'Expense added' });
    }

    if (action === 'delete') {
      // 1件削除
      const deleteId = String(contents.id);
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === deleteId) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return createJsonResponse({ status: 'success', message: 'Expense deleted' });
    }

    return createJsonResponse({ status: 'error', message: 'Invalid action' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * CORS対応のJSONレスポンスを作成するヘルパー
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
