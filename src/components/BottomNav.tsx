import React from 'react';
import { LayoutDashboard, Plus, ListOrdered, Settings, CheckCircle2 } from 'lucide-react';

export type TabType = 'summary' | 'settlement' | 'list' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAddModal: () => void;
  unsettledCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  unsettledCount = 0,
}) => {
  return (
    <nav className="fixed bottom-4 left-0 right-0 z-30 px-4 pointer-events-none">
      <div className="max-w-sm mx-auto bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-full px-3 py-2 flex items-center justify-around pointer-events-auto relative">
        {/* 左1: ダッシュボード・集計 */}
        <button
          onClick={() => onTabChange('summary')}
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all active:scale-90 ${
            activeTab === 'summary'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="集計・精算"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 font-extrabold">集計</span>
        </button>

        {/* 左2: 精算管理・未精算トータル */}
        <button
          onClick={() => onTabChange('settlement')}
          className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all active:scale-90 ${
            activeTab === 'settlement'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="精算管理"
        >
          <CheckCircle2 className="w-5 h-5" />
          {unsettledCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
              {unsettledCount}
            </span>
          )}
          <span className="text-[9px] mt-0.5 font-extrabold">精算</span>
        </button>

        {/* 中央: 支出追加FAB (Floating Action Button) */}
        <button
          onClick={onOpenAddModal}
          className="bg-gradient-to-tr from-navy-950 via-navy-900 to-slate-800 text-white p-4 rounded-full shadow-lg shadow-navy-900/30 hover:scale-105 active:scale-90 transition-all transform border-2 border-white -mt-5"
          aria-label="支出を登録"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* 右1: 明細履歴 */}
        <button
          onClick={() => onTabChange('list')}
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all active:scale-90 ${
            activeTab === 'list'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="明細履歴"
        >
          <ListOrdered className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 font-extrabold">明細</span>
        </button>

        {/* 右2: 設定 */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all active:scale-90 ${
            activeTab === 'settings'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="設定"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 font-extrabold">設定</span>
        </button>
      </div>
    </nav>
  );
};
