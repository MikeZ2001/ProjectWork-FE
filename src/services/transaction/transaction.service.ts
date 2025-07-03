import {Transaction} from "@models/transaction";
import api from "../api";

class TransactionService {
    async getTransactions(accountId: number, page: number = 1, per_page: number = 10): Promise<{ data: Transaction[]; total: number }> {
        try {
            const response = await api.get(`/v1/accounts/${accountId}/transactions?page=${page}&per_page=${per_page}`);
            return {
                data: response.data.data,
                total: response.data.total
            };
        } catch (error) {
            console.error(`Error fetching transactions for account ${accountId}:`, error);
            throw error;
        }
    }

    async createTransaction(accountId: number, transactionData: Partial<Transaction>): Promise<Transaction> {
        try {
            const response = await api.post<any>(`/v1/accounts/${accountId}/transactions`, transactionData);
           return response.data;
        } catch (error) {
            console.error(`Error creating transaction for account ${accountId}:`, error);
            throw error;
        }
    }

    async getTransactionById(accountId: string, transactionId: string): Promise<Transaction> {
        try {
            const response = await api.get<any>(`/v1/accounts/${accountId}/transactions/${transactionId}`);

            return response.data;
        } catch (error) {
            console.error(`Error fetching transaction ${transactionId}:`, error);
            throw error;
        }
    }

    async deleteTransaction(accountId: number, transactionId: number): Promise<any> {
        try {
            const response = await api.delete(`/v1/transactions/${transactionId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting transaction ${transactionId}:`, error);
            throw error;
        }
    }

    async updateTransaction(accountId: number, transactionId: number, transactionData: Partial<Transaction>): Promise<Transaction> {
        try {

            const response = await api.put<any>(`/v1/transactions/${transactionId}`, transactionData);

            return response.data
        } catch (error) {
            console.error(`Error updating transaction ${transactionId}:`, error);
            throw error;
        }
    }

    async transferFunds(fromAccountId: number, toAccountId: number, amount: number, description?: string): Promise<any> {
        try {
            const apiData = {
                from_account_id: fromAccountId,
                to_account_id: toAccountId,
                amount: amount,
                description: description
            };

            const response = await api.post<any>('/transfers', apiData);
            return response.data;
        } catch (error) {
            console.error('Error transferring funds:', error);
            throw error;
        }
    }
}

export default new TransactionService();