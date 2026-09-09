import React, { useState } from 'react';
import { MonthlySummary } from '../types/expense';
import { formatCurrency } from '../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp, CheckCircle2, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  summary: MonthlySummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4">
      {/* 1. ダッシュボードカード */}
      <div className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-slate-900 to-navy-800 text-white rounded-3xl p-6 shadow-xl border border-slate-700/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-blue-400" />
                今月の合計支出
              </span>
              <div className="text-4xl font-black text-white tracking-tight mt-1">
                {formatCurrency(summary.totalAmount)}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 backdrop-blur-md text-[11px] font-bold text-slate-300 px-3 py-1.5 rounded-full">
              ふたりの支出
            </div>
          </div>

          {/* 精算額のインラインカード */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 backdrop-blur-sm shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {summary.settlementAmount > 0 ? (
                  summary.settlementPayer === 'wife' ? (
                    <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                      <ArrowDownLeft className="w-5 h-5" />
                    </div>
                  )
                ) : (
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}

                <div>
                  <div className="text-[11px] font-medium text-slate-400">精算ステータス（自動計算）</div>
                  {summary.settlementAmount > 0 ? (
                    <div className="text-sm font-bold text-slate-100 mt-0.5">
                      <span className={summary.settlementPayer === 'wife' ? 'text-orange-400 font-extrabold' : 'text-blue-400 font-extrabold'}>
                        {summary.settlementPayer === 'wife' ? 'ともこ' : 'しんた'}
                      </span>
                      {' → '}
                      <span className={summary.settlementRecipient === 'husband' ? 'text-blue-400 font-extrabold' : 'text-orange-400 font-extrabold'}>
                        {summary.settlementRecipient === 'husband' ? 'しんた' : 'ともこ'}
                      </span>
                      {' に '}
                      <span className="text-amber-300 font-black text-base">
                        {formatCurrency(summary.settlementAmount)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      精算額 0円 (ぴったり均衡)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 内訳展開 */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-3 w-full pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <span>精算計算の詳細内訳</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDetails && (
              <div className="mt-3 pt-2 text-xs space-y-2 border-t border-slate-700/40 text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300">👨 しんたの支払い実績:</span>
                  <span className="font-bold">{formatCurrency(summary.shintaPaidTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>　└ しんたの本来負担額:</span>
                  <span>{formatCurrency(summary.shintaBurdenTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-orange-300">
                  <span className="text-orange-300">👩 ともこの支払い実績:</span>
                  <span className="font-bold">{formatCurrency(summary.tomokoPaidTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>　└ ともこの本来負担額:</span>
                  <span>{formatCurrency(summary.tomokoBurdenTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. 支払者別実績カード（しんた・ともこ） */}
      <div className="grid grid-cols-2 gap-3">
        {/* しんたのカード */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              👨 しんたの支払い
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(summary.shintaPaidTotal)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              負担額: {formatCurrency(summary.shintaBurdenTotal)}
            </div>
          </div>
        </div>

        {/* ともこのカード */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              👩 ともこの支払い
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(summary.tomokoPaidTotal)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              負担額: {formatCurrency(summary.tomokoBurdenTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
