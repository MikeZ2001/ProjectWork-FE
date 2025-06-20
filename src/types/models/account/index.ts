import {AccountType} from "@models/account/enums/account.type";
import {AccountStatus} from "@models/account/enums/account.status";

export interface Account {
    id: string;
    type: AccountType
    balance: number;
    openDate: string;
    closureDate: string;
    status: AccountStatus
}