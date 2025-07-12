import { Account } from "@models/account";
import api from "../api";

class AccountService {
    async getAccounts(page: number = 1, per_page: number = 10): Promise<{ data: Account[]; total: number }> {
        try {
            const response = await api.get(`v1/accounts?page=${page}&per_page=${per_page}`);
            return {
                data: response.data.data,
                total: response.data.meta.total
            };
        } catch (error) {
            console.error('Accounts retrieval error', error);
            throw error;
        }
    }

    async getAccountById(id: number) {
        try {
            const response = await api.get(`v1/accounts/${id}`)
            return response.data
        } catch (error) {
            console.error('Account retrieval error', error);
            throw error;
        }
    }

    async createAccount(accountData: Partial<Account>): Promise<Account> {
        try {
            const response = await api.post<Account>('/v1/accounts', accountData);
            return response.data;
        } catch (error) {
            console.error('Error creating account:', error);
            throw error;
        }
    }

    async updateAccount(id: number | undefined, accountData: Partial<Account>): Promise<Account> {
        try {
            const response = await api.put<Account>(`/v1/accounts/${id}`, accountData);
            return response.data;
        } catch (error) {
            console.error(`Error updating account ${id}:`, error);
            throw error;
        }
    }

    async deleteAccount(id: number) {
        try {
            await api.delete(`v1/accounts/${id}`)
        } catch (error) {
            console.error('Account deletion error', error)
            throw error;
        }
    }
}

export default new AccountService();