import {TransactionType} from "@models/transaction/enums/transaction.type";

export interface Transaction {
    id: number;
    account_id: number;
    amount: number;
    type: TransactionType
    date: string;
    description: string;
}