import {AccountType} from "@models/account/enums/account.type";
import {AccountStatus} from "@models/account/enums/account.status";

export interface Account {
    id: number;
    type: AccountType
    balance: number;
    open_date: string;
    close_date: string|null;
    status: AccountStatus
}