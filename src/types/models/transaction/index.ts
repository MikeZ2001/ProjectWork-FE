import {TransactionType} from "@models/transaction/enums/transaction.type";
import {Category} from "@models/category";

export interface Transaction {
    id: number;
    account_id: number;
    category_id: number;
    amount: number;
    type: TransactionType
    transaction_date: string;
    description: string;
    category: Category
}