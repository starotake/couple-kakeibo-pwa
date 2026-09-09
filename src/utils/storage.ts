import { Expense } from '../types/expense';

const STORAGE_KEY = 'couple_kakeibo_expenses_v2';
const GAS_URL_KEY = 'couple_kakeibo_gas_url_v1';

/**
 * 設定された GAS API URL を取得
 */
export const getGasApiUrl = (): string => {
  const savedUrl = localStorage.getItem(GAS_URL_KEY);
  if (savedUrl && savedUrl.trim() !== '') {
    return savedUrl.trim();
  }
  return (import.meta.env.VITE_GAS_API_URL as string) || '';
};

/**
 * GAS API URL を保存
 */
export const saveGasApiUrl = (url: string): void => {
  localStorage.setItem(GAS_URL_KEY, url.trim());
};

const getInitialSampleExpenses = (): Expense[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const ym = `${year}-${month}`;

  return [
    {
      id: 'sample-1',
      date: `${ym}-02`,
      amount: 8500,
      category: '食費',
      payer: 'husband',
      ratio: { husband: 50, wife: 50 },
      memo: '週末のまとめ買いスーパー',
      createdAt: Date.now() - 700000,
    },
    {
      id: 'sample-2',
      date: `${ym}-05`,
      amount: 12000,
      category: '娯楽',
      payer: 'husband',
      ratio: { husband: 70, wife: 30 },
      memo: '記念日ディナー',
      createdAt: Date.now() - 600000,
    },
    {
      id: 'sample-3',
      date: `${ym}-08`,
      amount: 3400,
      category: '日用品',
      payer: 'wife',
      ratio: { husband: 50, wife: 50 },
      memo: '洗剤・トイレットペーパー等',
      createdAt: Date.now() - 500000,
    },
    {
      id: 'sample-4',
      date: `${ym}-10`,
      amount: 15600,
      category: '光熱費',
      payer: 'husband',
      ratio: { husband: 50, wife: 50 },
      memo: '今月の電気・ガス代',
      createdAt: Date.now() - 400000,
    },
  ];
};

export const loadExpenses = (): Expense[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const initial = getInitialSampleExpenses();
      saveExpenses(initial);
      return initial;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load expenses from localStorage:', error);
    return getInitialSampleExpenses();
  }
};

export const saveExpenses = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Failed to save expenses to localStorage:', error);
  }
};

export const resetToSampleExpenses = (): Expense[] => {
  const samples = getInitialSampleExpenses();
  saveExpenses(samples);
  return samples;
};

export const exportExpensesAsJSON = (expenses: Expense[]): void => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(expenses, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `futuari-kakeibo-backup-${new Date().toISOString().substring(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
