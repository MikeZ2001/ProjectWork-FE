export interface Transaction {
    id: number;
    account_id: number;
    amount: number;
    type: 'deposit' | 'withdrawal' | 'transfer';
    date: string;
    description: string;
}