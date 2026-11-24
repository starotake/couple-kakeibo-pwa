import { useState, useEffect } from 'react';
import { Expense, SettlementMap } from './types/expense';
import {
  loadExpenses,
  saveExpenses,
  loadSettlements,
  saveSettlements,
  getGasApiUrl,
} from './utils/storage';
import { GasApiService } from './services/api';
import { calculateMonthlySummary, calculateUnsettledTotal } from './utils/calculation';
import { getTodayString } from './utils/formatters';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { SummaryCards } from './components/SummaryCards';
import { CategoryChart } from './components/CategoryChart';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { SettlementOverview } from './components/SettlementOverview';
import { SettingsModal } from './components/SettingsModal';
import { RefreshCw } from 'lucide-react';

export function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<SettlementMap>({});
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(
    getTodayString().substring(0, 7)
  );
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // クラウドデータ同期（支出＋精算フラグ）
  const refreshCloudData = async () => {
    const url = getGasApiUrl();
    if (!url) return;

    setIsSyncing(true);
    try {
      const cloudData = await GasApiService.fetchCloudData(url);
      if (Array.isArray(cloudData.expenses) && cloudData.expenses.length > 0) {
        setExpenses(cloudData.expenses);
        saveExpenses(cloudData.expenses);
      }
      // 精算管理シート対応のGASから返ってきた場合のみ上書き同期
      if (cloudData.settlements !== undefined) {
        setSettlements(cloudData.settlements);
        saveSettlements(cloudData.settlements);
      }
    } catch (err) {
      console.warn('Cloud sync error, fallback to local storage:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 初回ロード
  useEffect(() => {
    const localData = loadExpenses();
    setExpenses(localData);
    setSettlements(loadSettlements());

    // GAS URLが設定されていれば同期
    const url = getGasApiUrl();
    if (url) {
      refreshCloudData();
    }
  }, []);

  const updateExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    saveExpenses(newExpenses);
  };

  const updateSettlements = (newSettlements: SettlementMap) => {
    setSettlements(newSettlements);
    saveSettlements(newSettlements);
  };

  // 支出追加・更新
  const handleSaveExpense = async (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    let updatedExpenses: Expense[] = [];
    let targetExpense: Expense;

    if (editingId) {
      targetExpense = {
        ...expenseData,
        id: editingId,
        createdAt: Date.now(),
      };
      updatedExpenses = expenses.map((item) =>
        item.id === editingId ? targetExpense : item
      );
    } else {
      targetExpense = {
        ...expenseData,
        id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        createdAt: Date.now(),
      };
      updatedExpenses = [targetExpense, ...expenses];
    }

    updateExpenses(updatedExpenses);

    const newYm = expenseData.date.substring(0, 7);
    setCurrentYearMonth(newYm);

    setIsAddModalOpen(false);
    setActiveTab('summary');

    // GAS API が設定されていればバックグラウンド同期
    const url = getGasApiUrl();
    if (url) {
      setIsSyncing(true);
      await GasApiService.syncAllExpenses(url, updatedExpenses, settlements);
      setIsSyncing(false);
    }
  };

  // 支出削除
  const handleDeleteExpense = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    updateExpenses(updated);

    const url = getGasApiUrl();
    if (url) {
      setIsSyncing(true);
      await GasApiService.deleteExpense(url, id);
      setIsSyncing(false);
    }
  };

  // 指定した年月の精算済みフラグを切り替え
  const handleToggleSettlement = async (yearMonth: string) => {
    const current = settlements[yearMonth];
    const nextIsSettled = !current?.isSettled;
    const updatedSettlements: SettlementMap = {
      ...settlements,
      [yearMonth]: {
        yearMonth,
        isSettled: nextIsSettled,
        settledAt: nextIsSettled ? getTodayString() : undefined,
      },
    };

    updateSettlements(updatedSettlements);

    const url = getGasApiUrl();
    if (url) {
      setIsSyncing(true);
      await GasApiService.syncSettlements(url, updatedSettlements);
      setIsSyncing(false);
    }
  };

  // 未精算の月をすべてまとめて精算済みにする
  const handleSettleAllUnsettled = async () => {
    const today = getTodayString();
    const updatedSettlements: SettlementMap = { ...settlements };

    for (const item of unsettledSummary.monthlyItems) {
      if (!item.isSettled && item.summary.settlementAmount > 0) {
        updatedSettlements[item.yearMonth] = {
          yearMonth: item.yearMonth,
          isSettled: true,
          settledAt: today,
        };
      }
    }

    updateSettlements(updatedSettlements);

    const url = getGasApiUrl();
    if (url) {
      setIsSyncing(true);
      await GasApiService.syncSettlements(url, updatedSettlements);
      setIsSyncing(false);
    }
  };

  const handleStartEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsAddModalOpen(true);
  };

  const summary = calculateMonthlySummary(expenses, currentYearMonth);
  const unsettledSummary = calculateUnsettledTotal(expenses, settlements);
  const currentMonthSettlement = settlements[currentYearMonth];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans antialiased">
      {/* ヘッダー */}
      <Header
        currentYearMonth={currentYearMonth}
        onMonthChange={setCurrentYearMonth}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 同期インジケーター（同期中） */}
      {isSyncing && (
        <div className="bg-blue-600 text-white text-[11px] font-bold py-1 px-3 text-center flex items-center justify-center gap-1.5 animate-fade-in shadow-xs">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Googleスプレッドシートと同期中...
        </div>
      )}

      {/* メインビュー */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-5">
        {activeTab === 'summary' && (
          <>
            <SummaryCards
              summary={summary}
              isCurrentMonthSettled={Boolean(currentMonthSettlement?.isSettled)}
              currentMonthSettledAt={currentMonthSettlement?.settledAt}
              onToggleCurrentMonthSettlement={() => handleToggleSettlement(currentYearMonth)}
              unsettledSummary={unsettledSummary}
              onOpenSettlementTab={() => setActiveTab('settlement')}
            />
            <CategoryChart expenses={expenses} currentYearMonth={currentYearMonth} />

            <button
              onClick={() => setActiveTab('list')}
              className="w-full py-4 bg-white hover:bg-slate-100 border border-slate-100 rounded-3xl text-xs font-black text-slate-700 shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>
                この月の支出明細を見る (
                {expenses.filter((e) => e.date.startsWith(currentYearMonth)).length}件)
              </span>
            </button>
          </>
        )}

        {activeTab === 'settlement' && (
          <SettlementOverview
            unsettledSummary={unsettledSummary}
            onToggleSettlement={handleToggleSettlement}
            onSettleAllUnsettled={handleSettleAllUnsettled}
            onSelectMonth={(ym) => {
              setCurrentYearMonth(ym);
              setActiveTab('summary');
            }}
          />
        )}

        {activeTab === 'list' && (
          <ExpenseList
            expenses={expenses}
            currentYearMonth={currentYearMonth}
            onEdit={handleStartEdit}
            onDelete={handleDeleteExpense}
          />
        )}
      </main>

      {/* ボトムナビゲーション */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAddModal={handleOpenAddModal}
        unsettledCount={unsettledSummary.unsettledMonthsCount}
      />

      {/* Bottom Sheet モーダル */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end justify-center p-0 animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => {
              setIsAddModalOpen(false);
              setEditingExpense(null);
            }}
          />

          <div className="relative z-10 w-full max-w-md">
            <ExpenseForm
              initialExpense={editingExpense}
              onSave={handleSaveExpense}
              onCancel={() => {
                setIsAddModalOpen(false);
                setEditingExpense(null);
              }}
              isBottomSheet={true}
            />
          </div>
        </div>
      )}

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        expenses={expenses}
        settlements={settlements}
        onUpdateExpenses={updateExpenses}
        onUpdateSettlements={updateSettlements}
        onRefreshCloudData={refreshCloudData}
      />
    </div>
  );
}

export default App;
