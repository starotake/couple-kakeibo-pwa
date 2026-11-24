import { Expense, SettlementMap } from '../types/expense';

export interface CloudDataResponse {
  expenses: Expense[];
  settlements?: SettlementMap; // 旧バージョンのGASの場合は undefined になる
}

/**
 * Google Apps Script (GAS) Web API と通信するクライアントクラス
 */
export class GasApiService {
  /**
   * GASから最新の支出データと精算ステータスを取得
   */
  static async fetchCloudData(apiUrl: string): Promise<CloudDataResponse> {
    if (!apiUrl) return { expenses: [] };

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
      if (result.status === 'success') {
        const expenses = Array.isArray(result.data) ? result.data : [];
        const settlements =
          result.settlements && typeof result.settlements === 'object'
            ? (result.settlements as SettlementMap)
            : undefined;
        return { expenses, settlements };
      }
      return { expenses: [] };
    } catch (error) {
      console.error('Failed to fetch cloud data from GAS:', error);
      throw error;
    }
  }

  /**
   * GASから最新の支出データ一覧のみを取得（後方互換用）
   */
  static async fetchExpenses(apiUrl: string): Promise<Expense[]> {
    const result = await this.fetchCloudData(apiUrl);
    return result.expenses;
  }

  /**
   * GASに全支出データ（および任意で精算ステータス）を取り込み・同期
   */
  static async syncAllExpenses(
    apiUrl: string,
    expenses: Expense[],
    settlements?: SettlementMap
  ): Promise<boolean> {
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
          ...(settlements ? { settlements } : {}),
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
   * GASに月別精算ステータスのみを同期
   */
  static async syncSettlements(
    apiUrl: string,
    settlements: SettlementMap
  ): Promise<boolean> {
    if (!apiUrl) return false;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'sync_settlements',
          settlements,
        }),
      });

      if (!response.ok) return false;
      const result = await response.json();
      return result.status === 'success';
    } catch (error) {
      console.error('Failed to sync settlements to GAS:', error);
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
