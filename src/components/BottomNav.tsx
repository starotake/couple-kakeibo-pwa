import React from 'react';
import { LayoutDashboard, Plus, ListOrdered, Settings } from 'lucide-react';

export type TabType = 'summary' | 'list' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
}) => {
  return (
    <nav className="fixed bottom-4 left-0 right-0 z-30 px-4 pointer-events-none">
      <div className="max-w-xs mx-auto bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-full p-2 flex items-center justify-around pointer-events-auto relative">
        {/* 左: ダッシュボード・集計 */}
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

        {/* 中央: 支出追加FAB (Floating Action Button) */}
        <button
          onClick={onOpenAddModal}
          className="bg-gradient-to-tr from-navy-950 via-navy-900 to-slate-800 text-white p-4 rounded-full shadow-lg shadow-navy-900/30 hover:scale-105 active:scale-90 transition-all transform border-2 border-white -mt-5"
          aria-label="支出を登録"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* 右: 明細履歴 */}
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

        {/* 右端: 設定 */}
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
