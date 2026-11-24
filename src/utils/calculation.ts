import {
  Expense,
  MonthlySummary,
  SettlementMap,
  MonthlySettlementItem,
  UnsettledTotalSummary,
} from '../types/expense';

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

/**
 * 全期間の月別精算状況と、未精算分のトータル金額を計算します
 */
export const calculateUnsettledTotal = (
  expenses: Expense[],
  settlements: SettlementMap
): UnsettledTotalSummary => {
  // 支出が存在する全年月を抽出
  const monthSet = new Set<string>();
  for (const expense of expenses) {
    if (expense.date && expense.date.length >= 7) {
      monthSet.add(expense.date.substring(0, 7));
    }
  }

  // 新しい年月順にソート
  const sortedMonths = Array.from(monthSet).sort((a, b) => b.localeCompare(a));

  let unsettledMonthsCount = 0;
  // 符号付き未精算トータル（正: ともこ→しんた、負: しんた→ともこ）
  let netUnsettledAmount = 0;

  const monthlyItems: MonthlySettlementItem[] = sortedMonths.map((yearMonth) => {
    const summary = calculateMonthlySummary(expenses, yearMonth);
    const expenseCount = expenses.filter((e) => e.date.startsWith(yearMonth)).length;
    const record = settlements[yearMonth];
    const isSettled = Boolean(record?.isSettled);

    // 未精算かつ精算額がある月のみトータルに加算（相殺）
    if (!isSettled && summary.settlementAmount > 0) {
      unsettledMonthsCount += 1;
      if (summary.settlementPayer === 'wife') {
        netUnsettledAmount += summary.settlementAmount;
      } else if (summary.settlementPayer === 'husband') {
        netUnsettledAmount -= summary.settlementAmount;
      }
    }

    return {
      yearMonth,
      summary,
      expenseCount,
      isSettled,
      settledAt: record?.settledAt,
    };
  });

  const totalAmount = Math.round(Math.abs(netUnsettledAmount));
  let settlementPayer: 'husband' | 'wife' | 'none' = 'none';
  let settlementRecipient: 'husband' | 'wife' | 'none' = 'none';

  if (netUnsettledAmount > 0) {
    settlementPayer = 'wife';
    settlementRecipient = 'husband';
  } else if (netUnsettledAmount < 0) {
    settlementPayer = 'husband';
    settlementRecipient = 'wife';
  }

  return {
    unsettledMonthsCount,
    totalAmount,
    settlementPayer,
    settlementRecipient,
    monthlyItems,
  };
};
