/**
 * 支出データの型定義
 * 支払者: しんた / ともこ
 */

export type Category = '食費' | '日用品' | '光熱費' | '子供' | '娯楽' | 'その他';

export type Payer = 'husband' | 'wife'; // husband = しんた, wife = ともこ

export interface Ratio {
  husband: number; // しんたの負担割合 (%)
  wife: number;    // ともこの負担割合 (%)
}

export interface Expense {
  id: string;
  date: string;       // YYYY-MM-DD
  amount: number;     // 金額（円）
  category: Category; // カテゴリ
  payer: Payer;       // 支払者
  ratio: Ratio;       // 負担比率 (しんた:ともこ)
  memo?: string;      // メモ
  createdAt: number;  // タイムスタンプ
}

export interface MonthlySummary {
  totalAmount: number;             // 今月の総支出
  shintaPaidTotal: number;         // しんたの支払い合計
  tomokoPaidTotal: number;         // ともこの支払い合計
  shintaBurdenTotal: number;       // しんたの本来の負担額合計
  tomokoBurdenTotal: number;       // ともこの本来の負担額合計
  settlementAmount: number;        // 精算額（絶対値）
  settlementPayer: 'husband' | 'wife' | 'none'; // 精算金を払う人（husband=しんた, wife=ともこ）
  settlementRecipient: 'husband' | 'wife' | 'none'; // 精算金を受け取る人
}
