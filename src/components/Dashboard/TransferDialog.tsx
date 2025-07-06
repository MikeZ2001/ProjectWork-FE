import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import {Account} from "@models/account";
import TransactionService from "../../services/transaction/transaction.service";
interface TransferDialogProps {
    visible: boolean;
    accounts: Account[];
    fromAccountId?: number;
    onHide: () => void;
    onTransferComplete: () => void;
}

const TransferDialog: React.FC<TransferDialogProps> = ({
                                                           visible,
                                                           accounts,
                                                           fromAccountId,
                                                           onHide,
                                                           onTransferComplete
                                                       }) => {
    const [fromAccount, setFromAccount] = useState<Account | null>(null);
    const [toAccount, setToAccount] = useState<Account | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState<string>('');
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (fromAccountId && accounts.length > 0) {
            const account = accounts.find(a => a.id === fromAccountId);
            if (account) {
                setFromAccount(account);
            }
        }
    }, [fromAccountId, accounts]);

    const handleSubmit = async () => {
        setSubmitted(true);
        setErrorMessage('');

        if (!fromAccount || !toAccount || !amount || amount <= 0) {
            return;
        }

        if (fromAccount.id === toAccount.id) {
            setErrorMessage('You cannot transfer to the same account');
            return;
        }

        if (amount > fromAccount.balance) {
            setErrorMessage('Insufficient funds for this transfer');
            return;
        }

        setLoading(true);

        try {
            await TransactionService.transferFunds(
                fromAccount.id,
                toAccount.id,
                amount,
                description
            );

            resetForm();
            onTransferComplete();
            onHide();
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Failed to transfer funds. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setToAccount(null);
        setAmount(0);
        setDescription('');
        setSubmitted(false);
        setErrorMessage('');
    };

    const onDialogHide = () => {
        resetForm();
        onHide();
    };

    const footer = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={onDialogHide}
                disabled={loading}
            />
            <Button
                label="Transfer"
                icon="pi pi-check"
                onClick={handleSubmit}
                loading={loading}
            />
        </>
    );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

    const accountTemplate = (option: Account) => {
        if (!option || !option.type) {
            return <div>Select an account</div>;
        }

        const accountType = option.type || '';
        const balance = option.balance || 0;

        return (
            <div className="flex align-items-center">
                <div>
                    <span className="font-bold">{accountType.charAt(0).toUpperCase() + accountType.slice(1)}</span>
                    <p className="text-sm m-0 text-color-secondary">
                        Balance: {formatCurrency(balance)}
                    </p>
                </div>
            </div>
        );
    };

    const toAccountOptions = accounts.filter(a => a.id !== fromAccount?.id);

    return (
        <Dialog
            header="Transfer Funds"
            visible={visible}
            style={{ width: '450px' }}
            modal
            footer={footer}
            onHide={onDialogHide}
        >
            {errorMessage && (
                <div className="p-message p-message-error p-mb-3">
                    <div className="p-message-wrapper">
                        <span className="p-message-text">{errorMessage}</span>
                    </div>
                </div>
            )}

            <div className="field">
                <label htmlFor="fromAccount" className="font-bold">From Account</label>
                <Dropdown
                    id="fromAccount"
                    value={fromAccount}
                    options={accounts}
                    onChange={(e) => {
                        setFromAccount(e.value);

                        if (toAccount && e.value && e.value.id === toAccount.id) {
                            setToAccount(null);
                        }
                    }}
                    optionLabel="accountType"
                    placeholder="Select source account"
                    filter
                    filterBy="accountType"
                    itemTemplate={accountTemplate}
                    valueTemplate={accountTemplate}
                    className={classNames({ 'p-invalid': submitted && !fromAccount })}
                />
                {submitted && !fromAccount && <small className="p-error">Source account is required.</small>}
            </div>

            <div className="field">
                <label htmlFor="toAccount" className="font-bold">To Account</label>
                <Dropdown
                    id="toAccount"
                    value={toAccount}
                    options={toAccountOptions}
                    onChange={(e) => setToAccount(e.value)}
                    optionLabel="accountType"
                    placeholder="Select destination account"
                    filter
                    filterBy="accountType"
                    itemTemplate={accountTemplate}
                    valueTemplate={accountTemplate}
                    className={classNames({ 'p-invalid': submitted && !toAccount })}
                    disabled={!fromAccount}
                />
                {submitted && !toAccount && <small className="p-error">Destination account is required.</small>}
            </div>

            <div className="field">
                <label htmlFor="amount" className="font-bold">Amount</label>
                <InputNumber
                    id="amount"
                    value={amount}
                    onValueChange={(e) => setAmount(e.value || 0)}
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    className={classNames({ 'p-invalid': submitted && (!amount || amount <= 0) })}
                />
                {submitted && (!amount || amount <= 0) && <small className="p-error">Please enter a valid amount greater than zero.</small>}
                {fromAccount && (
                    <small className="text-color-secondary block mt-1">
                        Available balance: {formatCurrency(fromAccount.balance)}
                    </small>
                )}
            </div>

            <div className="field">
                <label htmlFor="description" className="font-bold">Description (Optional)</label>
                <InputText
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a description for this transfer"
                />
            </div>
        </Dialog>
    );
};

export default TransferDialog;