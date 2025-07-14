import React, {useEffect, useRef, useState} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import {Dialog} from 'primereact/dialog';
import {InputText} from 'primereact/inputtext';
import {Dropdown} from 'primereact/dropdown';
import {InputNumber} from 'primereact/inputnumber';
import {Calendar} from 'primereact/calendar';
import {Toast} from 'primereact/toast';
import {Account} from "@models/account";
import {Transaction} from "@models/transaction";
import TransactionService from "../services/transaction/transaction.service";
import AccountService from "../services/account/account.service";
import {TransactionType} from "types/models/transaction/enums/transaction.type";
import {Category} from "@models/category";
import CategoryService from "../services/category/category.service";
import TransactionDialog from "../components/account/TransactionDialog";

const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactionDialog, setTransactionDialog] = useState(false);
  const [deleteTransactionDialog, setDeleteTransactionDialog] = useState(false);
  const [transaction, setTransaction] = useState<Partial<Transaction>>({
    type: TransactionType.Transfer,
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
  const [categories, setCategories] = useState<Category[]>([]);

  const toLocalIsoDate = (d: Date) => {
    const offsetMs = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - offsetMs);
    return local.toISOString().split('T')[0];
  };


  const transactionTypes = [
    { label: 'Deposit', value: 'deposit' },
    { label: 'Withdrawal', value: 'withdrawal' }
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
    if (transaction && transaction.transaction_date) {
      setTransactionDate(new Date(transaction.transaction_date));
    } else {
      setTransactionDate(null);
    }
  }, [transaction]);

  const onCalendarChange = (e: any) => {
    const picked: Date = e.value;
    setTransactionDate(picked);
    setTransaction(prev => ({
      ...prev,
      transaction_date: picked.toISOString(),
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
      setTotalRecords(transactions.total)
    } catch (error) {
      console.error(`Failed to load transactions for account ${accountId}`, error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load transactions', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categories = await CategoryService.getCategories();
      setCategories(categories.data);
    } catch (error) {
      console.error(`Failed to load categories`, error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load categories', life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  const onPageChange = async (event: any) => {
    const newPage = Math.floor(event.first / event.rows) + 1;
    setRows(event.rows);
    setCurrentPage(newPage);
    if (selectedAccount?.id) {
      await loadTransactions(selectedAccount.id, newPage, event.rows)
    }
  };



  const openNew = () => {
    loadCategories();
    setTransaction({
      type: TransactionType.Withdrawal,
      amount: 0,
      description: '',
      transaction_date: new Date().toISOString()
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
    loadCategories();
    console.log(transaction);
    setTransaction({...transaction});
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
        transaction.transaction_date = toLocalIsoDate(transactionDate!);
        transaction.category_id = transaction.category?.id;
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
        transaction.transaction_date = toLocalIsoDate(transactionDate!);
        transaction.category_id = transaction.category?.id;
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
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
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
    if (!rowData.transaction_date) return '';
    return new Date(rowData.transaction_date).toLocaleDateString();
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

  const categoryTemplate = (transaction: Transaction) => {
    return transaction.category?.name ?? 'Uncategorized';
  }

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
        <Column field="id" header="ID" style={{ minWidth: '5rem' }}></Column>
        <Column field="type" header="Type" body={typeTemplate} style={{ minWidth: '8rem' }}></Column>
        <Column field="category" header="Category" body={categoryTemplate} style={{ minWidth: '8rem' }}></Column>
        <Column field="amount" header="Amount" body={amountTemplate} style={{ minWidth: '8rem' }}></Column>
        <Column field="date" header="Date" body={dateTemplate} style={{ minWidth: '8rem' }}></Column>
        <Column field="description" header="Description" style={{ minWidth: '10rem' }}></Column>
        <Column body={actionBodyTemplate} style={{ width: '8rem' }}></Column>
      </DataTable>

      <TransactionDialog
          visible={transactionDialog}
          transaction={transaction}
          transactionDate={transactionDate}
          transactionTypes={transactionTypes}
          categories={categories}
          submitted={submitted}
          footer={transactionDialogFooter}
          onHide={hideDialog}
          onDropdownChange={onDropdownChange}
          onAmountChange={onAmountChange}
          onCalendarChange={onCalendarChange}
          onInputChange={onInputChange}
      />

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