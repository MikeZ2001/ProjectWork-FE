import { Account } from "@models/account";
import api from "../api";

class AccountService {
    async getAccounts(page: number = 1, per_page: number = 10): Promise<{ data: Account[]; total: number }> {
        try {
            const response = await api.get(`v1/accounts?page=${page}&per_page=${per_page}`);
            return {
                data: response.data.data,     // actual accounts
                total: response.data.total    // total record count for pagination
            };
        } catch (error) {
            console.error('Accounts retrieval error', error);
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