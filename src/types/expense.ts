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

/**
 * 各月の精算済みステータス
 */
export interface MonthlySettlementRecord {
  yearMonth: string;   // 対象年月 (YYYY-MM)
  isSettled: boolean;  // 精算済みフラグ
  settledAt?: string;  // 精算済みにした日時 (YYYY-MM-DD)
}

/**
 * 年月をキーとした精算ステータスマップ
 */
export type SettlementMap = Record<string, MonthlySettlementRecord>;

/**
 * 月別の精算一覧表示用データ
 */
export interface MonthlySettlementItem {
  yearMonth: string;       // 対象年月 (YYYY-MM)
  summary: MonthlySummary; // その月の集計結果
  expenseCount: number;    // その月の支出件数
  isSettled: boolean;      // 精算済みフラグ
  settledAt?: string;      // 精算日 (YYYY-MM-DD)
}

/**
 * 全期間の未精算トータル集計結果
 */
export interface UnsettledTotalSummary {
  unsettledMonthsCount: number;                     // 未精算の月数（精算額 > 0 の月）
  totalAmount: number;                              // 未精算トータル額（相殺後の絶対値）
  settlementPayer: 'husband' | 'wife' | 'none';     // トータルで支払う人
  settlementRecipient: 'husband' | 'wife' | 'none'; // トータルで受け取る人
  monthlyItems: MonthlySettlementItem[];            // 月別の精算一覧（新しい年月順）
}
