import React, { useState } from 'react';
import { UnsettledTotalSummary } from '../types/expense';
import { formatCurrency } from '../utils/formatters';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronRight,
  Sparkles,
  CheckCheck,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';

interface SettlementOverviewProps {
  unsettledSummary: UnsettledTotalSummary;
  onToggleSettlement: (yearMonth: string) => void;
  onSettleAllUnsettled: () => void;
  onSelectMonth: (yearMonth: string) => void;
}

type FilterMode = 'all' | 'unsettled' | 'settled';

/**
 * 年月文字列(YYYY-MM)を「YYYY年M月」形式に変換します
 */
const formatYearMonthLabel = (yearMonth: string): string => {
  const [y, m] = yearMonth.split('-');
  return `${y}年${parseInt(m, 10)}月`;
};

/**
 * 日付文字列(YYYY-MM-DD)を「M/D」形式に変換します
 */
const formatShortDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
};

export const SettlementOverview: React.FC<SettlementOverviewProps> = ({
  unsettledSummary,
  onToggleSettlement,
  onSettleAllUnsettled,
  onSelectMonth,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const filteredItems = unsettledSummary.monthlyItems.filter((item) => {
    if (filterMode === 'unsettled') {
      return !item.isSettled && item.summary.settlementAmount > 0;
    }
    if (filterMode === 'settled') {
      return item.isSettled || item.summary.settlementAmount === 0;
    }
    return true;
  });

  const handleBulkSettle = () => {
    if (
      window.confirm(
        `未精算の ${unsettledSummary.unsettledMonthsCount} ヶ月分をすべて「精算済み」にしますか？`
      )
    ) {
      onSettleAllUnsettled();
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. 未精算トータル・ヒーローカード */}
      <div className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-slate-900 to-navy-800 text-white rounded-3xl p-6 shadow-xl border border-slate-700/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                {unsettledSummary.unsettledMonthsCount > 0 ? (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                )}
                未精算トータル（全期間相殺）
              </span>
              <div className="text-4xl font-black text-white tracking-tight mt-1">
                {formatCurrency(unsettledSummary.totalAmount)}
              </div>
            </div>

            <div
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold border backdrop-blur-md flex-shrink-0 ${
                unsettledSummary.unsettledMonthsCount > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              }`}
            >
              {unsettledSummary.unsettledMonthsCount > 0
                ? `未精算 ${unsettledSummary.unsettledMonthsCount}ヶ月分`
                : 'すべて精算済み'}
            </div>
          </div>

          {/* 誰から誰へトータル精算するか */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 backdrop-blur-sm">
            {unsettledSummary.totalAmount > 0 ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span
                    className={
                      unsettledSummary.settlementPayer === 'wife'
                        ? 'text-orange-400 font-extrabold'
                        : 'text-blue-400 font-extrabold'
                    }
                  >
                    {unsettledSummary.settlementPayer === 'wife' ? '👩 ともこ' : '👨 しんた'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span
                    className={
                      unsettledSummary.settlementRecipient === 'husband'
                        ? 'text-blue-400 font-extrabold'
                        : 'text-orange-400 font-extrabold'
                    }
                  >
                    {unsettledSummary.settlementRecipient === 'husband' ? '👨 しんた' : '👩 ともこ'}
                  </span>
                </div>
                <span className="text-amber-300 font-black text-base">
                  {formatCurrency(unsettledSummary.totalAmount)}
                </span>
              </div>
            ) : unsettledSummary.unsettledMonthsCount > 0 ? (
              <div className="text-xs font-bold text-emerald-300">
                未精算の月同士がちょうど相殺され、現在の差額は 0円 です。
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>未精算の残高はありません！</span>
              </div>
            )}
          </div>

          {/* まとめて精算済みボタン */}
          {unsettledSummary.unsettledMonthsCount > 0 && (
            <button
              onClick={handleBulkSettle}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              <span>未精算の {unsettledSummary.unsettledMonthsCount}ヶ月分をまとめて精算済みにする</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. フィルター（セグメントコントロール風） */}
      <div className="bg-slate-200/70 p-1 rounded-2xl grid grid-cols-3 gap-1">
        {(
          [
            { id: 'all', label: `すべて (${unsettledSummary.monthlyItems.length})` },
            { id: 'unsettled', label: `未精算 (${unsettledSummary.unsettledMonthsCount})` },
            { id: 'settled', label: '精算済み' },
          ] as { id: FilterMode; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id)}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 ${
              filterMode === tab.id
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. 各月の精算ステータスカード一覧 */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 space-y-2">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-600 text-sm font-bold">該当する月のデータはありません</p>
          <p className="text-slate-400 text-xs font-medium">
            {filterMode === 'unsettled'
              ? '未精算の月はありません。すっきり完了しています！'
              : '支出を登録すると月ごとの精算状況がここに表示されます。'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const { yearMonth, summary, expenseCount, isSettled, settledAt } = item;
            const hasSettlement = summary.settlementAmount > 0;

            return (
              <div
                key={yearMonth}
                className={`bg-white rounded-3xl p-4 shadow-sm border transition-all space-y-3 ${
                  isSettled
                    ? 'border-emerald-200/80 bg-emerald-50/20'
                    : hasSettlement
                    ? 'border-amber-200/80'
                    : 'border-slate-100'
                }`}
              >
                {/* 上段: 年月・総支出 & 精算トグルボタン */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectMonth(yearMonth)}
                    className="flex items-center gap-1.5 text-left group active:scale-95 transition"
                  >
                    <div>
                      <div className="flex items-center gap-1 text-base font-black text-navy-900 group-hover:text-blue-600 transition">
                        <span>{formatYearMonthLabel(yearMonth)}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-semibold">
                        総支出 {formatCurrency(summary.totalAmount)} ・ {expenseCount}件
                      </div>
                    </div>
                  </button>

                  {/* 精算フラグ切り替えボタン */}
                  {hasSettlement ? (
                    <button
                      onClick={() => onToggleSettlement(yearMonth)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 active:scale-95 transition-all border ${
                        isSettled
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {isSettled ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>精算済み</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-amber-500" />
                          <span>未精算</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-2xl text-[11px] font-bold bg-slate-100 text-slate-500">
                      精算不要
                    </span>
                  )}
                </div>

                {/* 下段: 差し引き金額と支払内訳 */}
                <div
                  className={`rounded-2xl p-3 flex items-center justify-between ${
                    isSettled
                      ? 'bg-emerald-50/70 border border-emerald-100'
                      : 'bg-slate-50 border border-slate-100'
                  }`}
                >
                  {hasSettlement ? (
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span
                        className={
                          summary.settlementPayer === 'wife'
                            ? 'text-orange-600 font-extrabold'
                            : 'text-blue-600 font-extrabold'
                        }
                      >
                        {summary.settlementPayer === 'wife' ? 'ともこ' : 'しんた'}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span
                        className={
                          summary.settlementRecipient === 'husband'
                            ? 'text-blue-600 font-extrabold'
                            : 'text-orange-600 font-extrabold'
                        }
                      >
                        {summary.settlementRecipient === 'husband' ? 'しんた' : 'ともこ'}
                      </span>
                      {isSettled && settledAt && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md ml-1">
                          {formatShortDate(settledAt)} 完了
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-emerald-600">ぴったり均衡</div>
                  )}

                  <div
                    className={`text-base font-black tracking-tight ${
                      isSettled
                        ? 'text-slate-400 line-through'
                        : hasSettlement
                        ? 'text-navy-900'
                        : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(summary.settlementAmount)}
                  </div>
                </div>

                {/* 支払いミニサマリー */}
                <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-400">
                  <span>👨 しんた支払: {formatCurrency(summary.shintaPaidTotal)}</span>
                  <span>👩 ともこ支払: {formatCurrency(summary.tomokoPaidTotal)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
