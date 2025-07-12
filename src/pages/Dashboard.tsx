import React, {useEffect, useState} from 'react';
import {Card} from 'primereact/card';
import {Button} from 'primereact/button';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Chart} from 'primereact/chart';
import {Dialog} from 'primereact/dialog';
import {InputText} from 'primereact/inputtext';
import {Dropdown} from 'primereact/dropdown';
import {classNames} from 'primereact/utils';
import {formatDate, getMonthFromDate} from '../utils/dateUtils';
import {Account} from "@models/account";
import {Transaction} from "@models/transaction";
import {AccountType} from "types/models/account/enums/account.type";
import {TransactionType} from "types/models/transaction/enums/transaction.type";
import AccountService from "../services/account/account.service";
import TransactionService from "../services/transaction/transaction.service";
import TransferDialog from "../components/Dashboard/TransferDialog";

const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    type: AccountType.Investment
  });
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: TransactionType.Deposit,
    amount: 0,
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const accountTypes = [
    { label: 'Checking', value: AccountType.Checking.toString() },
    { label: 'Savings', value: AccountType.Savings.toString() },
    { label: 'Investment', value: AccountType.Investment.toString() },
    { label: 'Cash', value: AccountType.Cash.toString() }
  ];

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount.id);
      prepareChartData();
    }
  }, [selectedAccount]);

  const onPageChange = async (event: any) => {
    const newPage = Math.floor(event.first / event.rows) + 1;
    setRows(event.rows);
    setCurrentPage(newPage);
    if (selectedAccount?.id) {
      await loadTransactions(selectedAccount.id, newPage, event.rows)
    }
  };


  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await AccountService.getAccounts();
      setAccounts(accounts.data);

      if (accounts.data.length > 0 && !selectedAccount) {
        setSelectedAccount(accounts.data[0]);
      }
    } catch (error) {
      console.error('Failed to load accounts', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (accountId: number, page = 1, perPage = 10) => {
    try {
      const transactions = await TransactionService.getTransactions(accountId, page, perPage);
      setTransactions(transactions.data);
      setTotalRecords(transactions.total);
    } catch (error) {
      console.error('Failed to load transactions', error);
    }
  };

  const prepareChartData = () => {
    if (!transactions.length) {
      setChartData({});
      return;
    }

    const monthlyData = transactions.reduce((acc: Record<string, { balance: number, expenses: number }>, transaction) => {
      const month = getMonthFromDate(transaction.date);

      if (!acc[month]) {
        acc[month] = { balance: 0, expenses: 0 };
      }

      if (transaction.type === 'deposit' || transaction.type === 'transfer') {
        acc[month].balance += transaction.amount;
      } else if (transaction.type === 'withdrawal') {
        acc[month].expenses += transaction.amount;
      }

      return acc;
    }, {});

    const months = Object.keys(monthlyData);
    const labels = months.slice(-6);

    const balanceData = labels.map(month => monthlyData[month].balance);
    const expensesData = labels.map(month => monthlyData[month].expenses);

    const data = {
      labels,
      datasets: [
        {
          label: 'Income',
          data: balanceData,
          fill: false,
          borderColor: '#4caf50',
          tension: 0.4
        },
        {
          label: 'Expenses',
          data: expensesData,
          fill: false,
          borderColor: '#f44336',
          tension: 0.4
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Account Activity'
        }
      }
    };

    setChartData(data);
    setChartOptions(options);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const balanceTemplate = (rowData: Account) => {
    return formatCurrency(rowData.balance);
  };

  const accountTypeTemplate = (rowData: Account) => {
    const accountType = rowData.type || (rowData as any).type || 'unknown';
    return accountType.charAt(0).toUpperCase() + accountType.slice(1);
  };

  const statusTemplate = (rowData: Account) => {
    const status = rowData.status || (rowData as any).status || 'unknown';
    return (
        <span className={`p-tag p-tag-${status === 'active' ? 'success' : 'danger'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const actionTemplate = (rowData: Account) => {
    return (
        <div className="flex gap-2">
          <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-sm"
                  onClick={() => setSelectedAccount(rowData)} />
        </div>
    );
  };

  const transactionAmountTemplate = (rowData: Transaction) => {
    const isDeposit = rowData.type === 'deposit';
    const amount = rowData.amount || 0;
    return (
        <span className={isDeposit ? 'text-green-500' : 'text-red-500'}>
        {isDeposit ? '+' : '-'} {formatCurrency(Math.abs(amount))}
      </span>
    );
  };

  const transactionDateTemplate = (rowData: Transaction) => {
    if (!rowData.date) return '';
    return formatDate(rowData.date);
  };

  const handleCreateAccount = async () => {
    setSubmitted(true);

    if (!newAccount.type) return;

    try {
      const createdAccount = await AccountService.createAccount(newAccount);
      setAccounts(prev => [...prev, createdAccount]);
      setShowAccountDialog(false);
      setNewAccount({ type: AccountType.Checking });
      setSubmitted(false);
    } catch (error) {
      console.error('Failed to create account', error);
    }
  };

  const handleCreateTransaction = async () => {
    setSubmitted(true);

    if (!newTransaction.amount || !newTransaction.type || !selectedAccount) return;

    try {
      const createdTransaction = await TransactionService.createTransaction(
          selectedAccount.id,
          {
            ...newTransaction,
            account_id: selectedAccount.id,
            date: new Date().toISOString().split('T')[0]
          }
      );

      setTransactions(prev => [createdTransaction, ...prev]);

      const updatedAccount = await AccountService.getAccountById(selectedAccount.id);

      setAccounts(prev => prev.map(acc =>
          acc.id === updatedAccount.id ? updatedAccount : acc
      ));

      setSelectedAccount(updatedAccount);
      setShowTransactionDialog(false);
      setNewTransaction({ type: TransactionType.Deposit, amount: 0, description: '' });
      setSubmitted(false);
    } catch (error) {
      console.error('Failed to create transaction', error);
    }
  };

  const accountDialogFooter = (
      <>
        <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setShowAccountDialog(false)} />
        <Button label="Create" icon="pi pi-check" onClick={handleCreateAccount} />
      </>
  );

  const transactionDialogFooter = (
      <>
        <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setShowTransactionDialog(false)} />
        <Button label="Create" icon="pi pi-check" onClick={handleCreateTransaction} />
      </>
  );

  return (
      <div className="grid">
        <div className="col-12">
          <div className="flex justify-content-between align-items-center mb-3">
            <h1 className="m-0">Dashboard</h1>
          </div>
        </div>

        <div className="col-12 lg:col-4">
          <Card title="My Accounts" className="h-full">
            {accounts.length === 0 ? (
                <div className="p-4 text-center">
                  <p>No accounts found. Create your first account to get started.</p>
                </div>
            ) : (
                <DataTable value={accounts} loading={loading}
                           selectionMode="single" selection={selectedAccount}
                           onSelectionChange={(e) => setSelectedAccount(e.value as Account)}
                           responsiveLayout="scroll">
                  <Column field="accountType" header="Type" body={accountTypeTemplate} />
                  <Column field="balance" header="Balance" body={balanceTemplate} />
                  <Column field="status" header="Status" body={statusTemplate} />
                  <Column body={actionTemplate} style={{ width: '6rem' }} />
                </DataTable>
            )}
          </Card>
        </div>

        {selectedAccount && (
            <>
              <div className="col-12 lg:col-8">
                <Card title={`${accountTypeTemplate(selectedAccount)} Account Details`}
                      subTitle={`Account #${String(selectedAccount.id).substring(0, 8)}`}
                      className="h-full">
                  <div className="grid">
                    <div className="col-12 md:col-6">
                      <div className="mb-3">
                        <p className="text-lg font-bold">Current Balance</p>
                        <p className="text-3xl text-primary">{formatCurrency(selectedAccount.balance)}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-lg font-bold">Available Actions</p>
                        <div className="flex gap-2 mt-2">
                          <Button label="Deposit" icon="pi pi-arrow-down"
                                  onClick={() => {
                                    setNewTransaction({ type: TransactionType.Deposit, amount: 0, description: '' });
                                    setShowTransactionDialog(true);
                                  }} />
                          <Button label="Withdraw" icon="pi pi-arrow-up" className="p-button-secondary"
                                  onClick={() => {
                                    setNewTransaction({ type: TransactionType.Withdrawal, amount: 0, description: '' });
                                    setShowTransactionDialog(true);
                                  }} />
                          <Button label="Transfer" icon="pi pi-send" className="p-button-info"
                                  onClick={() => setShowTransferDialog(true)}
                                  disabled={accounts.length < 2} />
                        </div>
                      </div>
                    </div>
                    <div className="col-12 md:col-6">
                      <div style={{ height: '200px' }}>
                        <Chart type="line" data={chartData} options={chartOptions} />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="col-12">
                <Card title="Recent Transactions"
                      subTitle={`for ${accountTypeTemplate(selectedAccount)} Account #${String(selectedAccount.id).substring(0, 8)}`}>
                  {transactions.length === 0 ? (
                      <div className="p-4 text-center">
                        <p>No transactions found for this account.</p>
                      </div>
                  ) : (
                      <DataTable
                          value={transactions}
                          lazy
                          paginator
                          first={(currentPage - 1) * rows}
                          rows={rows}
                          totalRecords={totalRecords}
                          onPage={onPageChange}
                          loading={loading}
                          dataKey="id"
                          emptyMessage="No transactions found"
                          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} accounts"
                          rowsPerPageOptions={[5, 10, 25]}
                      >
                        <Column field="date" header="Date" body={transactionDateTemplate} sortable />
                        <Column field="type" header="Type" sortable />
                        <Column field="amount" header="Amount" body={transactionAmountTemplate} sortable />
                        <Column field="description" header="Description" sortable />
                      </DataTable>
                  )}
                </Card>
              </div>
            </>
        )}

        <Dialog visible={showAccountDialog} style={{ width: '450px' }} header="Create New Account"
                footer={accountDialogFooter} onHide={() => setShowAccountDialog(false)}>
          <div className="field">
            <label htmlFor="accountType" className="font-bold">Account Type</label>
            <Dropdown id="accountType" value={newAccount.type} options={accountTypes}
                      onChange={(e) => setNewAccount({ ...newAccount, type: e.value })}
                      placeholder="Select Account Type" className={classNames({ 'p-invalid': submitted && !newAccount.type })} />
            {submitted && !newAccount.type && <small className="p-error">Account type is required.</small>}
          </div>
        </Dialog>

        <Dialog visible={showTransactionDialog} style={{ width: '450px' }}
                header={`Create New ${newTransaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}`}
                footer={transactionDialogFooter} onHide={() => setShowTransactionDialog(false)}>

          <div className="field mt-3">
            <label htmlFor="amount" className="font-bold">Amount</label>
            <InputText id="amount" type="number" keyfilter="money"
                       value={newTransaction.amount?.toString() || ''}
                       onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
                       className={classNames({ 'p-invalid': submitted && (!newTransaction.amount || newTransaction.amount <= 0) })} />
            {submitted && (!newTransaction.amount || newTransaction.amount <= 0) &&
                <small className="p-error">Please enter a valid amount greater than zero.</small>}
          </div>

          <div className="field mt-3">
            <label htmlFor="description" className="font-bold">Description</label>
            <InputText id="description" value={newTransaction.description}
                       onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })} />
          </div>
        </Dialog>

        <TransferDialog
            visible={showTransferDialog}
            accounts={accounts}
            fromAccountId={selectedAccount?.id}
            onHide={() => setShowTransferDialog(false)}
            onTransferComplete={() => {
              loadAccounts();
              if (selectedAccount) {
                loadTransactions(selectedAccount.id);
              }
            }}
        />
      </div>
  );
};

export default Dashboard; 