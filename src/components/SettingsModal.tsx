import React, { useState, useRef, useEffect } from 'react';
import { Expense } from '../types/expense';
import { exportExpensesAsJSON, resetToSampleExpenses, getGasApiUrl, saveGasApiUrl } from '../utils/storage';
import { GasApiService } from '../services/api';
import { Download, Upload, RefreshCw, X, Smartphone, Trash2, ShieldCheck, Database, Check, Loader2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  onUpdateExpenses: (newExpenses: Expense[]) => void;
  onRefreshCloudData: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  expenses,
  onUpdateExpenses,
  onRefreshCloudData,
}) => {
  const [gasUrl, setGasUrl] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setGasUrl(getGasApiUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // GAS URL 保存 & 接続テスト
  const handleSaveGasUrl = async () => {
    saveGasApiUrl(gasUrl);
    setTestResult(null);

    if (!gasUrl.trim()) {
      alert('Google スプレッドシート API URL を空にしました（ローカルモード動作）。');
      return;
    }

    setIsTesting(true);
    try {
      const cloudData = await GasApiService.fetchExpenses(gasUrl.trim());
      setTestResult({
        success: true,
        message: `接続成功！Googleスプレッドシートから ${cloudData.length} 件の支出を取得しました。`,
      });
      await onRefreshCloudData();
    } catch (err) {
      setTestResult({
        success: false,
        message: '接続失敗。URLが正しいか、GASのアクセス権限が「全員 (Anyone)」になっているか確認してください。',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // クラウドへ現在データを一括プッシュ
  const handlePushAllToCloud = async () => {
    const url = getGasApiUrl();
    if (!url) {
      alert('まず上に Google スプレッドシート API URL を設定してください。');
      return;
    }

    if (window.confirm('現在の家計簿データをGoogleスプレッドシートに一括保存（全置き換え）しますか？')) {
      setIsTesting(true);
      const success = await GasApiService.syncAllExpenses(url, expenses);
      setIsTesting(false);
      if (success) {
        alert('Googleスプレッドシートへ全データを送信・保存しました！');
      } else {
        alert('送信に失敗しました。');
      }
    }
  };

  const handleExport = () => {
    exportExpensesAsJSON(expenses);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          onUpdateExpenses(importedData);
          alert('データの復元が成功しました！');
          onClose();
        } else {
          alert('不正なファイル形式です。');
        }
      } catch (err) {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSample = () => {
    if (window.confirm('現在のデータをリセットし、サンプルデータを読み込みますか？')) {
      const samples = resetToSampleExpenses();
      onUpdateExpenses(samples);
      alert('サンプルデータを投入しました。');
      onClose();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('本当にすべてのデータを消去しますか？')) {
      onUpdateExpenses([]);
      alert('データを削除しました。');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* ヘッダー */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-black text-navy-900 text-lg">設定・夫婦クラウド同期</h2>
            <p className="text-xs text-slate-400 font-medium">Googleスプレッドシート共有 ＆ バックアップ</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full active:scale-90 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Apps Script API URL 設定エリア */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-navy-900 font-bold text-xs">
            <Database className="w-4 h-4 text-emerald-600" />
            Google スプレッドシート API URL
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            デプロイした GAS Web アプリ URL（`https://script.google.com/.../exec`）を貼ると夫婦二人でリアルタイム共有されます。
          </p>

          <input
            type="text"
            value={gasUrl}
            onChange={(e) => setGasUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSaveGasUrl}
              disabled={isTesting}
              className="flex-1 py-2 px-3 bg-navy-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              URL保存・接続テスト
            </button>
            {gasUrl && (
              <button
                onClick={handlePushAllToCloud}
                disabled={isTesting}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 active:scale-95 transition"
                title="全データをスプレッドシートへ送信"
              >
                全保存
              </button>
            )}
          </div>

          {testResult && (
            <div
              className={`p-2.5 rounded-xl text-xs font-semibold ${
                testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>

        {/* PWA ガイド */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <Smartphone className="w-4 h-4 text-blue-600" />
            ホーム画面に追加（PWA対応）
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            ブラウザメニューから「ホーム画面に追加」を選択するとアプリ感覚で使えます。
          </p>
        </div>

        {/* バックアップ・復元 */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            ファイルバックアップ (JSON)
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleExport}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              JSONエクスポート
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              JSONインポート
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* データ消去 */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            データ操作・デモ
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleResetSample}
              className="w-full py-3 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <RefreshCw className="w-4 h-4 text-amber-600" />
              サンプルデータを再読み込み
            </button>

            <button
              onClick={handleClearAll}
              className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 border border-red-200/80 text-red-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              全データを消去
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          ふたり家計簿 PWA v1.0.0
        </div>
      </div>
    </div>
  );
};
