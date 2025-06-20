import { Account } from "@models/account";
import api from "../api";

class AccountService {
    async getAccounts(): Promise<Account[]> {
        try {
            const response = await api.get('v1/accounts');
            return response.data as Account[];
        } catch (error) {
            console.error('Accounts retrieval error', error);
            throw error;
        }
    }
}

export default new AccountService();