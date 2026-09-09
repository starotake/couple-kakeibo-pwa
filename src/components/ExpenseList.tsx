import React, { useState } from 'react';
import { Expense } from '../types/expense';
import { formatCurrency, getPayerLabel, getCategoryColor } from '../utils/formatters';
import { Filter, Trash2, Edit2, Search, Inbox, ShoppingBag } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  currentYearMonth: string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  currentYearMonth,
  onEdit,
  onDelete,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [payerFilter, setPayerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentYearMonth));

  const filteredExpenses = monthlyExpenses.filter((e) => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (payerFilter !== 'all' && e.payer !== payerFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchMemo = e.memo ? e.memo.toLowerCase().includes(q) : false;
      const matchCategory = e.category.toLowerCase().includes(q);
      if (!matchMemo && !matchCategory) return false;
    }
    return true;
  });

  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDeleteConfirm = (id: string, memo?: string) => {
    const title = memo ? `「${memo}」` : 'この支出';
    if (window.confirm(`${title}を削除しますか？`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* 検索・フィルターエリア */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="支出メモやカテゴリで検索..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-bold mr-1">
            <Filter className="w-3.5 h-3.5" />
            絞り込み:
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none"
          >
            <option value="all">すべてのカテゴリ</option>
            <option value="食費">食費</option>
            <option value="日用品">日用品</option>
            <option value="光熱費">光熱費</option>
            <option value="子供">子供</option>
            <option value="娯楽">娯楽</option>
            <option value="その他">その他</option>
          </select>

          <select
            value={payerFilter}
            onChange={(e) => setPayerFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none"
          >
            <option value="all">すべての支払者</option>
            <option value="husband">しんたの支払い</option>
            <option value="wife">ともこの支払い</option>
          </select>
        </div>
      </div>

      {/* 件数表示 */}
      <div className="flex justify-between items-center px-1 text-xs text-slate-400 font-bold">
        <span>全 {sortedExpenses.length} 件の支出明細</span>
      </div>

      {/* 履歴リスト */}
      {sortedExpenses.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 space-y-2">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-600 text-sm font-bold">該当する支出明細はありません</p>
          <p className="text-slate-400 text-xs font-medium">条件を変更するか、下の「＋」ボタンから追加してください。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedExpenses.map((item) => {
            const categoryColor = getCategoryColor(item.category);
            const payerLabel = getPayerLabel(item.payer);
            const sRatio = item.ratio?.husband ?? 50;
            const tRatio = item.ratio?.wife ?? 50;

            const payerBadgeClass =
              item.payer === 'husband'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-orange-50 text-orange-600 border-orange-200';

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between gap-3"
              >
                {/* アイコン & メモ情報 */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-xs"
                    style={{ backgroundColor: categoryColor }}
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {item.memo || item.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                      <span className="text-slate-400 font-medium">{item.date}</span>
                      <span className="text-slate-300">•</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold border ${payerBadgeClass}`}>
                        {payerLabel}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-semibold">
                        しんた{sRatio}:ともこ{tRatio}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 右側：金額 & アクション */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="text-lg font-black text-navy-900 tracking-tight">
                    {formatCurrency(item.amount)}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl active:scale-90 transition"
                      title="編集"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(item.id, item.memo)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl active:scale-90 transition"
                      title="削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
