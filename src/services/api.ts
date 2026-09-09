import { Expense } from '../types/expense';

/**
 * Google Apps Script (GAS) Web API と通信するクライアントクラス
 */
export class GasApiService {
  /**
   * GASから最新の支出データ一覧を取得
   */
  static async fetchExpenses(apiUrl: string): Promise<Expense[]> {
    if (!apiUrl) return [];

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success' && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch expenses from GAS:', error);
      throw error;
    }
  }

  /**
   * GASに全支出データを取り込み・同期
   */
  static async syncAllExpenses(apiUrl: string, expenses: Expense[]): Promise<boolean> {
    if (!apiUrl) return false;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'sync_all',
          expenses,
        }),
      });

      if (!response.ok) return false;
      const result = await response.json();
      return result.status === 'success';
    } catch (error) {
      console.error('Failed to sync all expenses to GAS:', error);
      return false;
    }
  }

  /**
   * 1件の支出を追加
   */
  static async addExpense(apiUrl: string, expense: Expense): Promise<boolean> {
    if (!apiUrl) return false;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'create',
          expense,
        }),
      });

      if (!response.ok) return false;
      const result = await response.json();
      return result.status === 'success';
    } catch (error) {
      console.error('Failed to add expense to GAS:', error);
      return false;
    }
  }

  /**
   * 1件の支出を削除
   */
  static async deleteExpense(apiUrl: string, id: string): Promise<boolean> {
    if (!apiUrl) return false;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'delete',
          id,
        }),
      });

      if (!response.ok) return false;
      const result = await response.json();
      return result.status === 'success';
    } catch (error) {
      console.error('Failed to delete expense from GAS:', error);
      return false;
    }
  }
}
