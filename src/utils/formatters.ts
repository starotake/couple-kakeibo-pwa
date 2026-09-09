import { Payer, Category } from '../types/expense';

/**
 * 日本円（JPY）表記にフォーマットします
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * 支払者の名前表記（しんた / ともこ）を取得します
 */
export const getPayerLabel = (payer: Payer): string => {
  switch (payer) {
    case 'husband':
      return 'しんた';
    case 'wife':
      return 'ともこ';
    default:
      return '';
  }
};

/**
 * カテゴリに応じた配色設定を取得します
 */
export const getCategoryColor = (category: Category): string => {
  switch (category) {
    case '食費':
      return '#EF4444'; // red-500
    case '日用品':
      return '#3B82F6'; // blue-500
    case '光熱費':
      return '#F59E0B'; // amber-500
    case '子供':
      return '#EC4899'; // pink-500
    case '娯楽':
      return '#10B981'; // emerald-500
    case 'その他':
      return '#8B5CF6'; // purple-500
    default:
      return '#6B7280'; // gray-500
  }
};

/**
 * 今日の日付文字列(YYYY-MM-DD)を取得します
 */
export const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 年月文字列(YYYY-MM)を取得します
 */
export const getYearMonthString = (dateStr: string): string => {
  return dateStr.substring(0, 7);
};
