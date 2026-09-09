/**
 * =================================================================
 * 夫婦の家計簿アプリ (ふたり家計簿) - Google Apps Script (GAS) コード
 * =================================================================
 * 
 * 【設定手順】
 * 1. 新しいGoogleスプレッドシートを作成し、名前を「ふたり家計簿データ」等にします。
 * 2. 上部メニュー [拡張機能] -> [Apps Script] を開きます。
 * 3. このコードをすべて貼り付けて保存（Ctrl+S / Cmd+S）します。
 * 4. 右上の [デプロイ] -> [新しいデプロイ] を選択します。
 * 5. 種類: [Web アプリ] を選択。
 * 6. 説明: 「ふたり家計簿 API v1」
 * 7. 実行するユーザー: 「自分」
 * 8. アクセスできるユーザー: 「全員 (Anyone)」★ここが重要です！
 * 9. [デプロイ] ボタンを押して、表示された「Web アプリの URL」をコピーします。
 */

const SHEET_NAME = '支出データ';

// 初期ヘッダー設定
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // 不要な初期シートがあれば削除してもOK
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

/**
 * データ取得 (GET リクエスト)
 */
function doGet(e) {
  try {
    const sheet = setupSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return createJsonResponse({ status: 'success', data: [] });
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

      expenses.push({
        id: String(row[0]),
        date: String(dateStr),
        amount: Number(row[2]) || 0,
        category: String(row[3] || '食費'),
        payer: String(row[4] || 'husband'), // 'husband'=しんた, 'wife'=ともこ
        ratio: {
          husband: Number(row[5]) ?? 50,
          wife: 100 - (Number(row[5]) ?? 50)
        },
        memo: String(row[6] || ''),
        createdAt: row[7] ? new Date(row[7]).getTime() : Date.now()
      });
    }

    return createJsonResponse({ status: 'success', data: expenses });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * データ追加・更新・削除 (POST リクエスト)
 */
function doPost(e) {
  try {
    const sheet = setupSheet();
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action; // 'create', 'update', 'delete', 'sync_all'

    if (action === 'sync_all') {
      // 全件一括置換（全データ更新）
      const expenses = contents.expenses || [];
      
      // ヘッダーを残してデータ部分を全削除
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 8).clearContent();
      }

      if (expenses.length > 0) {
        const rows = expenses.map(item => [
          item.id,
          item.date,
          item.amount,
          item.category,
          item.payer,
          item.ratio?.husband ?? 50,
          item.memo || '',
          new Date()
        ]);
        sheet.getRange(2, 1, rows.length, 8).setValues(rows);
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
        item.ratio?.husband ?? 50,
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
