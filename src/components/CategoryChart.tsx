import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Expense, Category } from '../types/expense';
import { calculateCategoryTotals } from '../utils/calculation';
import { formatCurrency, getCategoryColor } from '../utils/formatters';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryChartProps {
  expenses: Expense[];
  currentYearMonth: string;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ expenses, currentYearMonth }) => {
  const data = calculateCategoryTotals(expenses, currentYearMonth);
  const totalAmount = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center text-slate-400">
        <PieChartIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-semibold text-slate-500">今月の支出データはありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-navy-900 text-sm flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-blue-500" />
          カテゴリ内訳
        </h3>
        <span className="text-xs text-slate-400 font-medium">内訳割合</span>
      </div>

      {/* 円グラフ */}
      <div className="h-44 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={4}
              dataKey="value"
              cornerRadius={6}
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={getCategoryColor(entry.name as Category)}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), '金額']}
              contentStyle={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                backgroundColor: '#0F172A',
                color: '#fff'
              }}
              itemStyle={{ color: '#F8FAFC' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* ドーナツ中央に合計額 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">合計</span>
          <span className="text-xs font-black text-slate-800">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* カテゴリプログレスバー / リスト */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        {data.map((item) => {
          const percent = totalAmount > 0 ? Math.round((item.value / totalAmount) * 100) : 0;
          const color = getCategoryColor(item.name as Category);

          return (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: color }}
                  />
                  {item.name}
                </span>
                <span className="font-extrabold text-slate-900">
                  {formatCurrency(item.value)} <span className="text-slate-400 font-medium">({percent}%)</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percent}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
