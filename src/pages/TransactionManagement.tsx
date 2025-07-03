import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import {Account} from "@models/account";
import {Transaction} from "@models/transaction";
import TransactionService from "../services/transaction/transaction.service";
import AccountService from "../services/account/account.service";


const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactionDialog, setTransactionDialog] = useState(false);
  const [deleteTransactionDialog, setDeleteTransactionDialog] = useState(false);
  const [transaction, setTransaction] = useState<Partial<Transaction>>({
    type: 'deposit',
    amount: 0,
    description: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<number>(10);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useRef<Toast>(null);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [transactionDate, setTransactionDate] = useState<Date|null|undefined>(new Date());

  const transactionTypes = [
    { label: 'Deposit', value: 'deposit' },
    { label: 'Withdrawal', value: 'withdrawal' },
    { label: 'Transfer', value: 'transfer' }
  ];

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount.id, currentPage, rows);
    } else {
      setTransactions([]);
    }
  }, [selectedAccount]);

  useEffect(() => {
    if (transaction && transaction.date) {
      setTransactionDate(new Date(transaction.date));
    } else {
      setTransactionDate(null);
    }
  }, [transaction]);

  const onCalendarChange = (e: any) => {
    const picked: Date = e.value;
    setTransactionDate(picked);
    setTransaction(prev => ({
      ...prev,
      date: picked.toISOString(),    // or picked.toISOString().split('T')[0] if your API expects yyyy-mm-dd
    }));
  };

  const loadAccounts = async () => {
    try {
      const accounts = await AccountService.getAccounts();
      setAccounts(accounts.data);

      if (accounts.data.length > 0) {
        setSelectedAccount(accounts.data[0]);
      }
    } catch (error) {
      console.error('Failed to load accounts', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load accounts', life: 3000 });
    }
  };

  const loadTransactions = async (accountId: number, page: number = 1, perPage: number = 10) => {
    try {
      setLoading(true);
      const transactions = await TransactionService.getTransactions(accountId, page, perPage);
      setTransactions(transactions.data);
      setTotalRecords(transactions.total)
    } catch (error) {
      console.error(`Failed to load transactions for account ${accountId}`, error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load transactions', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = async (event: any) => {
    const newPage = Math.floor(event.first / event.rows) + 1;
    setRows(event.rows);
    setCurrentPage(newPage);
    if (selectedAccount?.id) {
      await loadTransactions(selectedAccount.id, newPage, event.rows)
    }
  };

  const openNew = () => {
    setTransaction({
      type: 'deposit',
      amount: 0,
      description: '',
      date: new Date().toISOString()
    });
    setSubmitted(false);
    setTransactionDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setTransactionDialog(false);
  };

  const hideDeleteTransactionDialog = () => {
    setDeleteTransactionDialog(false);
  };

  const editTransaction = (transaction: Transaction) => {
    setTransaction({...transaction, date: transaction.date});
    setTransactionDialog(true);
  };

  const confirmDeleteTransaction = (transaction: Transaction) => {
    setTransaction(transaction);
    setDeleteTransactionDialog(true);
  };

  const deleteTransaction = async () => {
    try {
      if (transaction.id && selectedAccount) {

        await TransactionService.deleteTransaction(selectedAccount.id, transaction.id);

        const updatedTransactions = transactions.filter(t => t.id !== transaction.id);
        setTransactions(updatedTransactions);

        const updatedAccount = await AccountService.getAccountById(selectedAccount.id);

        setAccounts(accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a));
        setSelectedAccount(updatedAccount);
        
        setDeleteTransactionDialog(false);
        setTransaction({});
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Transaction Deleted', life: 3000 });
      }
    } catch (error) {
      console.error('Error deleting transaction', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete transaction', life: 3000 });
    }
  };

  const saveTransaction = async () => {
    setSubmitted(true);

    if (!transaction.amount || !transaction.type || !selectedAccount) return;

    try {
      if (transaction.id) {
        transaction.date = transactionDate?.toISOString().split('T')[0];
        const updatedTransaction = await TransactionService.updateTransaction(
          selectedAccount.id,
          transaction.id,
          transaction
        );

        setTransactions(transactions.map(t => 
          t.id === updatedTransaction.id ? updatedTransaction : t
        ));

        const updatedAccount = await AccountService.getAccountById(selectedAccount.id);

        setAccounts(accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a));
        setSelectedAccount(updatedAccount);
        
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Transaction Updated', life: 3000 });
      } else {
        transaction.date = transactionDate?.toISOString().split('T')[0];
        const createdTransaction = await TransactionService.createTransaction(
          selectedAccount.id,
          transaction
        );

        setTransactions([createdTransaction, ...transactions]);

        const updatedAccount = await AccountService.getAccountById(selectedAccount.id);

        setAccounts(accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a));
        setSelectedAccount(updatedAccount);

        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Transaction Created', life: 3000 });
      }

      setTransactionDialog(false);
      setTransaction({});
    } catch (error) {
      console.error('Error saving transaction', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save transaction', life: 3000 });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const val = e.target.value;
    setTransaction(prevTransaction => ({
      ...prevTransaction,
      [name]: val
    }));
  };

  const onDropdownChange = (e: { value: any }, name: string) => {
    const val = e.value;
    setTransaction(prevTransaction => ({
      ...prevTransaction,
      [name]: val
    }));
  };

  const onAmountChange = (e: any, name: string) => {
    const val = e.value || 0;
    setTransaction(prevTransaction => ({
      ...prevTransaction,
      [name]: val
    }));
  };

  const onAccountChange = (e: { value: Account }) => {
    setSelectedAccount(e.value);
  };

  const dateTemplate = (rowData: Transaction) => {
    if (!rowData.date) return '';
    return new Date(rowData.date).toLocaleDateString();
  };

  const amountTemplate = (rowData: Transaction) => {
    const isDeposit = rowData.type === 'deposit';
    const amount = rowData.amount || 0;
    return (
      <span className={isDeposit ? 'text-green-500' : 'text-red-500'}>
        {isDeposit ? '+' : '-'} {formatCurrency(Math.abs(amount))}
      </span>
    );
  };

  const typeTemplate = (rowData: Transaction) => {
    const type = rowData.type || '';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const actionBodyTemplate = (rowData: Transaction) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-button-sm" onClick={() => editTransaction(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDeleteTransaction(rowData)} />
      </div>
    );
  };

  const transactionDialogFooter = (
    <>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" onClick={saveTransaction} />
    </>
  );

  const deleteTransactionDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTransactionDialog} />
      <Button label="Yes" icon="pi pi-check" className="p-button-danger" onClick={deleteTransaction} />
    </>
  );

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-3">
        <h1 className="m-0">Transaction Management</h1>
        <Button label="New Transaction" icon="pi pi-plus" className="p-button-success" onClick={openNew} disabled={!selectedAccount} />
      </div>
      
      <div className="mb-3">
        <label htmlFor="account" className="block mb-2 font-bold">Select Account:</label>
        <Dropdown
          id="account"
          value={selectedAccount}
          options={accounts}
          onChange={onAccountChange}
          optionLabel="type"
          itemTemplate={(option: Account) => (
            <div>
              {option.type.charAt(0).toUpperCase() + option.type.slice(1)} ({formatCurrency(option.balance)})
            </div>
          )}
          placeholder="Select an Account"
          className="w-full md:w-20rem"
        />
      </div>

      <DataTable 
        value={transactions}
        lazy
        paginator
        dataKey="id"
        first={(currentPage - 1) * rows}
        onPage = {onPageChange}
        rows={rows}
        loading={loading}
        totalRecords={totalRecords}
        rowsPerPageOptions={[5, 10, 25]} 
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} transactions"
        emptyMessage={selectedAccount ? "No transactions found for this account." : "Please select an account to view transactions."}
        className="p-datatable-sm"
      >
        <Column selectionMode="single" style={{ width: '3rem' }}></Column>
        <Column field="id" header="ID" sortable style={{ minWidth: '5rem' }}></Column>
        <Column field="type" header="Type" body={typeTemplate} sortable style={{ minWidth: '8rem' }}></Column>
        <Column field="amount" header="Amount" body={amountTemplate} sortable style={{ minWidth: '8rem' }}></Column>
        <Column field="date" header="Date" body={dateTemplate} sortable style={{ minWidth: '8rem' }}></Column>
        <Column field="description" header="Description" sortable style={{ minWidth: '10rem' }}></Column>
        <Column body={actionBodyTemplate} style={{ width: '8rem' }}></Column>
      </DataTable>

      {/* Transaction Dialog */}
      <Dialog
          visible={transactionDialog}
          style={{width: '450px'}}
          header={transaction.id ? "Edit Transaction" : "New Transaction"}
          modal
          className="p-fluid"
          footer={transactionDialogFooter}
          onHide={hideDialog}
      >
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
          {submitted && !transaction.type && <small className="p-error">Transaction Type is required.</small>}
        </div>

        <div className="field">
          <label htmlFor="amount">Amount</label>
          <InputNumber
              id="amount"
              value={transaction.amount}
              onValueChange={(e) => onAmountChange(e, 'amount')}
              mode="currency"
              currency="USD"
              locale="en-US"
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

      {/* Delete Transaction Dialog */}
      <Dialog
          visible={deleteTransactionDialog}
          style={{width: '450px'}}
          header="Confirm"
          modal
          footer={deleteTransactionDialogFooter}
          onHide={hideDeleteTransactionDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{fontSize: '2rem'}}/>
          {transaction && <span>Are you sure you want to delete this transaction?</span>}
        </div>
      </Dialog>
    </div>
  );
};

export default TransactionManagement; 