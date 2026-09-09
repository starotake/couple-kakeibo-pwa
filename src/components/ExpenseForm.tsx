import React, { useState, useEffect } from 'react';
import { Expense, Category, Payer } from '../types/expense';
import { getTodayString } from '../utils/formatters';
import { Plus, Check, Calendar, Tag, CreditCard, PieChart, FileText, X } from 'lucide-react';

interface ExpenseFormProps {
  initialExpense?: Expense | null;
  onSave: (expenseData: Omit<Expense, 'id' | 'createdAt'>, editingId?: string) => void;
  onCancel?: () => void;
  isBottomSheet?: boolean;
}

const CATEGORIES: Category[] = ['食費', '日用品', '光熱費', '子供', '娯楽', 'その他'];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialExpense,
  onSave,
  onCancel,
  isBottomSheet = false,
}) => {
  const [date, setDate] = useState(getTodayString());
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<Category>('食費');
  const [payer, setPayer] = useState<Payer>('husband');
  const [shintaRatio, setShintaRatio] = useState<number>(50);
  const [memo, setMemo] = useState<string>('');

  useEffect(() => {
    if (initialExpense) {
      setDate(initialExpense.date);
      setAmount(String(initialExpense.amount));
      setCategory(initialExpense.category);
      setPayer(initialExpense.payer);
      setShintaRatio(initialExpense.ratio?.husband ?? 50);
      setMemo(initialExpense.memo || '');
    }
  }, [initialExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('有効な金額を入力してください');
      return;
    }

    onSave(
      {
        date,
        amount: parsedAmount,
        category,
        payer,
        ratio: {
          husband: shintaRatio,
          wife: 100 - shintaRatio,
        },
        memo: memo.trim() || undefined,
      },
      initialExpense?.id
    );

    if (!initialExpense) {
      setAmount('');
      setMemo('');
    }
  };

  const handlePresetRatio = (h: number) => {
    setShintaRatio(h);
  };

  return (
    <div className={`bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 ${isBottomSheet ? 'animate-slide-up max-h-[90vh] overflow-y-auto' : ''}`}>
      {isBottomSheet && (
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2 mb-1" />
      )}

      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="font-black text-navy-900 text-lg tracking-tight">
            {initialExpense ? '支出の編集' : '新しい支出を登録'}
          </h2>
          <p className="text-xs text-slate-400 font-medium">金額と支払い情報を入力してください</p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full active:scale-90 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 金額入力 */}
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/70 focus-within:border-blue-500 focus-within:bg-white transition">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            支出金額 (JPY) *
          </label>
          <div className="relative flex items-center">
            <span className="text-3xl font-black text-slate-400 mr-2">¥</span>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              min="1"
              autoFocus={isBottomSheet}
              className="w-full bg-transparent text-3xl font-black text-navy-900 placeholder:text-slate-300 focus:outline-none"
            />
          </div>
        </div>

        {/* 実際に支払った人 */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
            支払った人
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPayer('husband')}
              className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition-all active:scale-95 border ${
                payer === 'husband'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50/50'
              }`}
            >
              👨 しんたが支払った
            </button>
            <button
              type="button"
              onClick={() => setPayer('wife')}
              className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition-all active:scale-95 border ${
                payer === 'wife'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-orange-50/50'
              }`}
            >
              👩 ともこが支払った
            </button>
          </div>
        </div>

        {/* 負担割合 */}
        <div className="bg-slate-50/80 p-4 rounded-3xl border border-slate-200/60 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-blue-500" />
              負担割合
            </label>
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full">しんた {shintaRatio}%</span>
              <span className="text-slate-300">:</span>
              <span className="text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-full">ともこ {100 - shintaRatio}%</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={shintaRatio}
            onChange={(e) => setShintaRatio(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy-900"
          />

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: '5:5 (折半)', h: 50 },
              { label: '7:3', h: 70 },
              { label: 'しんた全額', h: 100 },
              { label: 'ともこ全額', h: 0 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetRatio(preset.h)}
                className={`py-1.5 px-1 text-[11px] font-bold rounded-xl border transition active:scale-95 text-center ${
                  shintaRatio === preset.h
                    ? 'bg-navy-900 text-white border-navy-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 日付 & カテゴリ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              日付
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              カテゴリ
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition active:scale-95 ${
                    category === cat
                      ? 'bg-navy-900 text-white border-navy-900 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* メモ */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            メモ（任意）
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="オムツ代、習い事代、洋服など"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-blue-500 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 px-6 bg-gradient-to-r from-navy-900 to-slate-800 hover:from-slate-900 hover:to-navy-900 text-white font-extrabold rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {initialExpense ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span className="text-base">{initialExpense ? '変更を保存する' : '支出を保存する'}</span>
        </button>
      </form>
    </div>
  );
};
