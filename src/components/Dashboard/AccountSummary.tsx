import {Account} from "@models/account";
import {useMemo} from "react";
import {Card} from "primereact/card";

const totalAmountAccounts = (accounts: Account[] = []): number =>
accounts.reduce((sum, numStr) => sum + parseFloat(String(numStr.balance)), 0);

export function AccountSummary({
                                    accounts,
                                }: {
    accounts: Account[];
}) {
    const total = useMemo(
        () => totalAmountAccounts(accounts),
        [accounts]
    );

    return (
        <div>
            <Card title="Total amount accounts" className="w-full">
                <div className="text-2xl font-bold text-green-700">
                    {total.toLocaleString('it-IT', {
                        style: 'currency',
                        currency: 'EUR',
                    })}
                </div>
            </Card>
        </div>
    );
}