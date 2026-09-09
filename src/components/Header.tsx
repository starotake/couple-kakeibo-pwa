import React from 'react';
import { ChevronLeft, ChevronRight, Settings, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentYearMonth: string;
  onMonthChange: (newYearMonth: string) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentYearMonth,
  onMonthChange,
  onOpenSettings,
}) => {
  const [yearStr, monthStr] = currentYearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const handlePrevMonth = () => {
    const prevDate = new Date(year, month - 2, 1);
    const y = prevDate.getFullYear();
    const m = String(prevDate.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${y}-${m}`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, month, 1);
    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${y}-${m}`);
  };

  const handleCurrentMonth = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${y}-${m}`);
  };

  return (
    <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* ロゴ */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-navy-900 to-slate-700 text-white p-2 rounded-2xl shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h1 className="font-extrabold text-navy-900 text-base tracking-tight leading-none">ふたり家計簿</h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">PAIRED EXPENSES</span>
          </div>
        </div>

        {/* 年月ピルボタン */}
        <div className="flex items-center bg-slate-200/60 p-0.5 rounded-full border border-slate-300/40">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-full text-slate-600 hover:text-slate-900 active:scale-90 transition"
            aria-label="前月"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleCurrentMonth}
            className="px-2.5 py-0.5 text-xs font-bold text-slate-800 hover:text-blue-600 transition"
          >
            {year}年{month}月
          </button>

          <button
            onClick={handleNextMonth}
            className="p-1 rounded-full text-slate-600 hover:text-slate-900 active:scale-90 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 設定ボタン */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-full active:scale-95 transition"
          aria-label="設定"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
