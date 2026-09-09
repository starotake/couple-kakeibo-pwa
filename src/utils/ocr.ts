import { createWorker } from 'tesseract.js';

export interface OcrResult {
  amount?: number;
  date?: string; // YYYY-MM-DD
  memo?: string;
  rawText: string;
}

/**
 * レシート画像をOCR解析し、金額・日付・店舗名（メモ）を自動抽出します
 */
export const parseReceiptImage = async (
  imageFile: File | Blob
): Promise<OcrResult> => {
  // 日本語と英語の認識ワーカーを作成
  const worker = await createWorker('jpn+eng');
  
  try {
    const ret = await worker.recognize(imageFile);
    const text = ret.data.text;
    await worker.terminate();

    return parseReceiptText(text);
  } catch (error) {
    console.error('OCR Recognition failed:', error);
    await worker.terminate();
    throw error;
  }
};

/**
 * OCRテキストから金額・日付・店舗名を解析・正規表現抽出
 */
export const parseReceiptText = (rawText: string): OcrResult => {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let amount: number | undefined = undefined;
  let date: string | undefined = undefined;
  let memo: string | undefined = undefined;

  // 1. 金額の抽出
  // 「合計」「小計」「計」「支払」「TOTAL」「AMOUNT」などのキーワードを探す
  const totalKeywords = [/合計/i, /小計/i, /お買上/i, /支払/i, /TOTAL/i, /AMOUNT/i, /計/i];
  const candidates: { amount: number; priority: number }[] = [];

  for (const line of lines) {
    // コンマ入り数値または数値を検索 (例: 1,280 / ¥1280 / 1280円)
    const numMatch = line.match(/(?:[¥\\￥]\s*)?([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,7})(?:\s*円)?/);
    if (numMatch) {
      const numStr = numMatch[1].replace(/,/g, '');
      const parsedNum = parseInt(numStr, 10);

      // 極端に小さい数字や極端に大きい数字（電話番号等）を除外
      if (parsedNum >= 50 && parsedNum <= 1000000) {
        let priority = 1;
        // 「合計」等が含まれる行は最高優先度
        if (totalKeywords.some((kw) => kw.test(line))) {
          priority = 10;
        } else if (/[¥\\￥円]/.test(line)) {
          priority = 5;
        }
        candidates.push({ amount: parsedNum, priority });
      }
    }
  }

  // 優先度が高い順、同じなら金額が大きい順にソート
  if (candidates.length > 0) {
    candidates.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.amount - a.amount;
    });
    amount = candidates[0].amount;
  }

  // 2. 日付の抽出
  // パターン: YYYY/MM/DD, YYYY-MM-DD, YYYY年MM月DD日, 2026/09/09
  const dateRegex = /(20[2-9][0-9])[\/\-年\s]+(0?[1-9]|1[0-2])[\/\-月\s]+(0?[1-9]|[12][0-9]|3[01])(?:日)?/;
  const dateMatch = rawText.match(dateRegex);

  if (dateMatch) {
    const y = dateMatch[1];
    const m = dateMatch[2].padStart(2, '0');
    const d = dateMatch[3].padStart(2, '0');
    date = `${y}-${m}-${d}`;
  }

  // 3. 店舗名/メモの抽出
  // 通常レシートの1〜3行目に店舗名がある
  if (lines.length > 0) {
    // 「レシート」「領収書」「No.」「日時」などを除外
    const ignoreRegex = /レシート|領収|発行|電話|TEL|日時|No|会員/i;
    const storeLine = lines.slice(0, 4).find((line) => !ignoreRegex.test(line) && line.length >= 2);
    if (storeLine) {
      memo = storeLine.replace(/[#*※]/g, '').trim();
    }
  }

  return {
    amount,
    date,
    memo,
    rawText,
  };
};
