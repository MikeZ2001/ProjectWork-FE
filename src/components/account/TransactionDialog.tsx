import React, {useState} from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import {Category} from "@models/category";
import {Transaction} from "@models/transaction";


export interface TransactionDialogProps {
    visible: boolean;
    transaction: Partial<Transaction>;
    transactionDate: Date | null | undefined;
    transactionTypes: { label: string; value: string }[];
    categories: Category[];
    submitted: boolean;
    footer: React.ReactNode;
    onHide: () => void;
    onDropdownChange: (e: DropdownChangeEvent, field: keyof Transaction) => void;
    onAmountChange: (e: InputNumberValueChangeEvent, field: keyof Transaction) => void;
    onCalendarChange: (e: any) => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>, field: keyof Transaction) => void;
    hideTypeSelector?: boolean,
}

const TransactionDialog: React.FC<TransactionDialogProps> = ({
                                                                 visible,
                                                                 transaction,
                                                                 transactionDate,
                                                                 transactionTypes,
                                                                 categories,
                                                                 submitted,
                                                                 footer,
                                                                 onHide,
                                                                 onDropdownChange,
                                                                 onAmountChange,
                                                                 onCalendarChange,
                                                                 onInputChange,
                                                                 hideTypeSelector
                                                             }) => (
    <Dialog
        visible={visible}
        style={{ width: '450px' }}
        header={transaction.id ? 'Edit Transaction' : 'New Transaction'}
        modal
        className="p-fluid"
        footer={footer}
        onHide={onHide}
    >
        { !hideTypeSelector && (
        <div className="field">
            <label htmlFor="type">Transaction Type</label>
            <Dropdown
                id="type"
                value={transaction.type}
                options={transactionTypes}
                onChange={(e) => onDropdownChange(e, 'type')}
                placeholder="Select a Transaction Type"
                className={submitted && !transaction.type ? 'p-invalid' : ''}
            />
            {submitted && !transaction.type && (
                <small className="p-error">Transaction Type is required.</small>
            )}
        </div>
            )
        }

        <div className="field">
            <label htmlFor="category">Category</label>
            <Dropdown
                id="category"
                value={transaction.category}
                options={categories}
                optionLabel="name"
                onChange={(e) => onDropdownChange(e, 'category')}
                placeholder="Select a category"
                className={submitted && !transaction.category ? 'p-invalid' : ''}
            />
        </div>

        <div className="field">
            <label htmlFor="amount">Amount</label>
            <InputNumber
                id="amount"
                value={transaction.amount}
                onValueChange={(e) => onAmountChange(e, 'amount')}
                mode="currency"
                currency="EUR"
                locale="it-IT"
                className={submitted && !transaction.amount ? 'p-invalid' : ''}
            />
            {submitted && !transaction.amount && <small className="p-error">Amount is required.</small>}
        </div>

        <div className="field">
            <label htmlFor="date">Date</label>
            <Calendar
                id="date"
                value={transactionDate}
                onChange={onCalendarChange}
                dateFormat="yy-mm-dd"
                showIcon
                placeholder="YYYY-MM-DD"
            />
        </div>

        <div className="field">
            <label htmlFor="description">Description</label>
            <InputText
                id="description"
                value={transaction.description}
                onChange={(e) => onInputChange(e, 'description')}
                placeholder="Enter a description"
            />
        </div>
    </Dialog>
);

export default TransactionDialog;
