import { Expense, MonthlySummary } from '../types/expense';

/**
 * 対象年月の支出データを元に集計および精算額を計算します
 */
export const calculateMonthlySummary = (
  expenses: Expense[],
  yearMonth: string
): MonthlySummary => {
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(yearMonth));

  let totalAmount = 0;
  let shintaPaidTotal = 0;
  let tomokoPaidTotal = 0;

  let shintaBurdenTotal = 0;
  let tomokoBurdenTotal = 0;

  let shintaPaidTomokoShare = 0; // しんたが立替えたともこの負担分
  let tomokoPaidShintaShare = 0; // ともこが立替えたしんたの負担分

  for (const expense of monthlyExpenses) {
    const amount = expense.amount;
    totalAmount += amount;

    const sRatio = (expense.ratio?.husband ?? 50) / 100;
    const tRatio = (expense.ratio?.wife ?? 50) / 100;

    const shintaShare = amount * sRatio;
    const tomokoShare = amount * tRatio;

    shintaBurdenTotal += shintaShare;
    tomokoBurdenTotal += tomokoShare;

    if (expense.payer === 'husband') {
      shintaPaidTotal += amount;
      shintaPaidTomokoShare += tomokoShare;
    } else if (expense.payer === 'wife') {
      tomokoPaidTotal += amount;
      tomokoPaidShintaShare += shintaShare;
    }
  }

  // 精算額の相殺計算
  const netSettlement = shintaPaidTomokoShare - tomokoPaidShintaShare;
  const settlementAmount = Math.round(Math.abs(netSettlement));

  let settlementPayer: 'husband' | 'wife' | 'none' = 'none';
  let settlementRecipient: 'husband' | 'wife' | 'none' = 'none';

  if (netSettlement > 0) {
    // しんたが立替えた金額が大きいため、ともこからしんたへ支払う
    settlementPayer = 'wife';
    settlementRecipient = 'husband';
  } else if (netSettlement < 0) {
    // ともこが立替えた金額が大きいため、しんたからともこへ支払う
    settlementPayer = 'husband';
    settlementRecipient = 'wife';
  }

  return {
    totalAmount: Math.round(totalAmount),
    shintaPaidTotal: Math.round(shintaPaidTotal),
    tomokoPaidTotal: Math.round(tomokoPaidTotal),
    shintaBurdenTotal: Math.round(shintaBurdenTotal),
    tomokoBurdenTotal: Math.round(tomokoBurdenTotal),
    settlementAmount,
    settlementPayer,
    settlementRecipient,
  };
};

/**
 * カテゴリごとの合計支出を計算します
 */
export const calculateCategoryTotals = (
  expenses: Expense[],
  yearMonth: string
): { name: string; value: number }[] => {
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(yearMonth));
  const categoryMap: Record<string, number> = {};

  monthlyExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  return Object.entries(categoryMap)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value: Math.round(value) }));
};
