import React, {useEffect, useState} from 'react';
import {Card} from 'primereact/card';
import {Button} from 'primereact/button';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Dialog} from 'primereact/dialog';
import {classNames} from 'primereact/utils';
import {formatDate, getMonthFromDate} from '../utils/dateUtils';
import {Account} from "@models/account";
import {Transaction} from "@models/transaction";
import {AccountType} from "types/models/account/enums/account.type";
import {TransactionType} from "types/models/transaction/enums/transaction.type";
import AccountService from "../services/account/account.service";
import TransactionService from "../services/transaction/transaction.service";
import TransferDialog from "../components/Dashboard/TransferDialog";
import {CalendarViewChangeEvent} from "primereact/calendar";
import {InputNumberValueChangeEvent} from "primereact/inputnumber";
import TransactionDialog from "../components/account/TransactionDialog";
import {Dropdown, DropdownChangeEvent} from "primereact/dropdown";
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import {useAllTransactions, useAllTransactionsByAuthUser} from '../hooks/useAllTransactions';
import  {AccountSummary} from "../components/Dashboard/AccountSummary";

const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
const monthOptions = [{ label: 'All', value: 'all' }, ...allMonths.map(m => ({ label: m.toString().padStart(2, '0'), value: m }))];

const getMonthName = (month: number | 'all') => {
  if (month === 'all') return 'All';
  const found = monthNames.find(m => m.value === month);
  return found ? found.label : '';
};

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

const getFilterLabel = (year: number | 'all', month: number | 'all') => {
  if (year === 'all' && month === 'all') return ' (All Time)';
  if (year === currentYear && month === currentMonth) return ' (This Month)';
  let label = '';
  if (year !== 'all') label += `Year: ${year}`;
  if (month !== 'all') label += (label ? ', ' : '') + `Month: ${getMonthName(month)}`;
  return label ? ` (${label})` : '';
};

const getChartTitle = (base: string, year: number | 'all', month: number | 'all') => {
  return base + getFilterLabel(year, month);
};

const monthNames = [
  { label: 'All', value: 'all' },
  { label: 'Jan', value: 1 },
  { label: 'Feb', value: 2 },
  { label: 'Mar', value: 3 },
  { label: 'Apr', value: 4 },
  { label: 'May', value: 5 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 },
  { label: 'Aug', value: 8 },
  { label: 'Sep', value: 9 },
  { label: 'Oct', value: 10 },
  { label: 'Nov', value: 11 },
  { label: 'Dec', value: 12 }
];



const Dashboard: React.FC = () => {
  const { accounts, loading: accountsLoading, setAccounts } = useAccounts();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const { categories } = useCategories();

  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<number>(10);
  const {
    transactions,
    totalRecords,
    setTransactions,
    reloadTransactions
  } = useTransactions(selectedAccount?.id, currentPage, rows);

  const { transactions: allTransactions, loading: allTxLoading } = useAllTransactions(selectedAccount?.id);
// NEW: fetch all transactions across ALL accounts (pass undefined or adjust hook to support it)

  const { transactions: allTxAllAccounts, loading: allTxAllAccountsLoading } =
      useAllTransactionsByAuthUser();


  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(currentYear);

  // Fall back to current month/year when dropdown is "All"
  const effectiveYear: number = selectedYear === 'all' ? currentYear : selectedYear;
  const effectiveMonth: number = selectedMonth === 'all' ? currentMonth : selectedMonth;

  const filteredAllAccounts = (allTxAllAccounts || []).filter((t: Transaction) => {
    const d = new Date(t.transaction_date);
    return d.getFullYear() === effectiveYear && (d.getMonth() + 1) === effectiveMonth;
  });

  const totalSpendingAllAccounts = filteredAllAccounts
      .filter(t => t.type === TransactionType.Withdrawal)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const spendingByCategoryAll = (() => {
    const map: Record<string, number> = {};
    filteredAllAccounts
        .filter(t => t.type === TransactionType.Withdrawal)
        .forEach(t => {
          const name = t.category?.name || 'Uncategorized';
          map[name] = (map[name] || 0) + (Number(t.amount) || 0);
        });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  })();

  const totalDepositAllAccounts = filteredAllAccounts
      .filter(t => t.type === TransactionType.Deposit)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const depositByCategoryAll = (() => {
    const map: Record<string, number> = {};
    filteredAllAccounts
        .filter(t => t.type === TransactionType.Deposit)
        .forEach(t => {
          const name = t.category?.name || 'Uncategorized';
          map[name] = (map[name] || 0) + (Number(t.amount) || 0);
        });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  })();



  const years = Array.from(new Set(allTransactions.map((t: Transaction) => new Date(t.transaction_date).getFullYear()))) as number[];
  years.sort((a, b) => a - b);
  const yearOptions = [{ label: 'All', value: 'all' }, ...years.map(y => ({ label: y.toString(), value: y }))];

  const filteredTransactions = allTransactions.filter((t: Transaction) => {
    const d = new Date(t.transaction_date);
    return d.getFullYear() === effectiveYear && (d.getMonth() + 1) === effectiveMonth;
  });

  const incomeThisMonth = filteredTransactions
    .filter(t => t.type === TransactionType.Deposit)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const expensesThisMonth = filteredTransactions
    .filter(t => t.type === TransactionType.Withdrawal)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const netSavingsThisMonth = (Number(incomeThisMonth) || 0) - (Number(expensesThisMonth) || 0);

  const topSpendingCategories = (() => {
    const catMap: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === TransactionType.Withdrawal)
      .forEach(t => {
        const name = t.category?.name || 'Uncategorized';
        catMap[name] = (catMap[name] || 0) + (Number(t.amount) || 0);
      });
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  })();
  const topIncomeSources = (() => {
    const catMap: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === TransactionType.Deposit)
      .forEach(t => {
        const name = t.category?.name || 'Uncategorized';
        catMap[name] = (catMap[name] || 0) + (Number(t.amount) || 0);
      });
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  })();

  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    type: AccountType.Investment
  });

  const [submitted, setSubmitted] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: TransactionType.Deposit,
    amount: 0,
    description: '',
    category: undefined
  });

  const [transactionDate, setTransactionDate] = useState<Date | null | undefined>(new Date());
  const [transactionTypes] = useState([
    { label: 'Deposit', value: TransactionType.Deposit },
    { label: 'Withdrawal', value: TransactionType.Withdrawal }
  ]);

  const toLocalIsoDate = (d: Date) => {
    const offsetMs = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - offsetMs);
    return local.toISOString().split('T')[0];
  };

  const onPageChange = async (event: any) => {
    const newPage = Math.floor(event.first / event.rows) + 1;
    setRows(event.rows);
    setCurrentPage(newPage);
    if (selectedAccount?.id) {
      await reloadTransactions(selectedAccount.id, newPage, event.rows)
    }
  };

  const onDropdownChange = (e: DropdownChangeEvent, field: keyof Transaction) => {
    setNewTransaction(transaction => ({ ...transaction, [field]: e.value }));
  };

  const onAmountChange = (e: InputNumberValueChangeEvent, field: keyof Transaction) => {
    setNewTransaction(transaction => ({ ...transaction, [field]: e.value }));
  };

  const onCalendarChange = (e: CalendarViewChangeEvent) => {
    setTransactionDate(e.value as Date);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Transaction) => {
    setNewTransaction(transaction => ({ ...transaction, [field]: e.target.value }));
  };

  const accountTypes = [
    { label: 'Checking', value: AccountType.Checking.toString() },
    { label: 'Savings', value: AccountType.Savings.toString() },
    { label: 'Investment', value: AccountType.Investment.toString() },
    { label: 'Cash', value: AccountType.Cash.toString() }
  ];

  const handleCreateAccount = async () => {
    setSubmitted(true);

    if (!newAccount.type) return;

    try {
      const createdAccount = await AccountService.createAccount(newAccount);
      setAccounts((prev: Account[]) => [...prev, createdAccount]);
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
            category_id: newTransaction.category?.id,
            transaction_date: toLocalIsoDate(transactionDate!)
          }
      );

      setTransactions((prev: Transaction[]) => [createdTransaction, ...prev]);

      const updatedAccount = await AccountService.getAccountById(selectedAccount.id);

      setAccounts((prev: Account[]) => prev.map((acc: Account) =>
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

  const amountTemplate = (rowData: Transaction) => {
    const isDeposit = rowData.type === 'deposit';
    const amount = rowData.amount || 0;
    return (
        <span className={isDeposit ? 'text-green-500' : 'text-red-500'}>
        {isDeposit ? '+' : '-'} {formatCurrency(Math.abs(amount))}
      </span>
    );
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const balanceTemplate = (rowData: Account | null | undefined) => {
    return formatCurrency(rowData?.balance ?? 0);
  };

  const accountTypeTemplate = (rowData: Account | null | undefined) => {
    if (!rowData || !rowData.type) return '';
    const accountType = rowData.type || 'unknown';
    return accountType.charAt(0).toUpperCase() + accountType.slice(1);
  };

  const statusTemplate = (rowData: Account | null | undefined) => {
    if (!rowData || !rowData.status) return '';
    const status = rowData.status || 'unknown';
    return (
      <span className={`p-tag p-tag-${status === 'active' ? 'success' : 'danger'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const categoryTemplate = (transaction: Transaction | null | undefined) => {
    if (!transaction || !transaction.category) return 'Uncategorized';
    return transaction.category.name ?? 'Uncategorized';
  };

  const actionTemplate = (rowData: Account | null | undefined) => {
    if (!rowData) return null;
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-sm"
                onClick={() => setSelectedAccount(rowData)} />
      </div>
    );
  };

  const transactionAmountTemplate = (rowData: Transaction | null | undefined) => {
    if (!rowData || typeof rowData.amount !== 'number' || !rowData.type) return '';
    const isDeposit = rowData.type === 'deposit';
    const amount = rowData.amount || 0;
    return (
      <span className={isDeposit ? 'text-green-500' : 'text-red-500'}>
        {isDeposit ? '+' : '-'} {formatCurrency(Math.abs(amount))}
      </span>
    );
  };

  const transactionDateTemplate = (rowData: Transaction | null | undefined) => {
    if (!rowData || !rowData.transaction_date) return '';
    return formatDate(rowData.transaction_date);
  };

  const getRunningBalances = (transactions: Transaction[], startingBalance: number) => {

    let balance = startingBalance;
    return transactions.map(t => {
      const bal = balance;
      if (t.type === TransactionType.Withdrawal) {
        balance += Number(t.amount) || 0;
      } else if (t.type === TransactionType.Deposit) {
        balance -= Number(t.amount) || 0;
      }

      if (t.type === TransactionType.Withdrawal) {
        balance -= Number(t.amount) || 0;
      } else if (t.type === TransactionType.Deposit) {
        balance += Number(t.amount) || 0;
      }
      return bal;
    });
  };

  return (
    <div className="grid">
      <div className="col-12 md:col-6 lg:col-4">
        <Card title="My Accounts" className="h-full">
          {accounts.length === 0 ? (
            <div className="p-4 text-center">
              <p>No accounts found. Create your first account to get started.</p>
            </div>
          ) : (
            <DataTable value={accounts} loading={accountsLoading}
                       selectionMode="single" selection={selectedAccount}
                       onSelectionChange={(e) => setSelectedAccount(e.value as Account)}
                       responsiveLayout="scroll">
              <Column field="name" header="Name" />
              <Column field="accountType" header="Type" body={accountTypeTemplate} />
              <Column field="balance" header="Balance" body={balanceTemplate} />
              <Column field="status" header="Status" body={statusTemplate} />

            </DataTable>
          )}
        </Card>
      </div>

      {/* GLOBAL (ALL ACCOUNTS) SPENDING WIDGETS */}
      <div className="col-12 md:col-6 lg:col-8">
        <div className="grid h-full">
          <div className="col-12 md:col-4">
            <Card title={getChartTitle('Total Spending (All Accounts)', effectiveYear, effectiveMonth)}>
              <div className="text-2xl font-bold text-red-700">{formatCurrency(totalSpendingAllAccounts)}</div>
              <small className="block mt-1">Withdrawals across every account</small>
            </Card>

          </div>

          <div className="col-12 md:col-4">
          <Card title={getChartTitle('Total Deposit (All Accounts)', effectiveYear, effectiveMonth)}>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(totalDepositAllAccounts)}</div>
            <small className="block mt-1">Deposit across every account</small>
          </Card>
          </div>

          <div className="col-12 md:col-4">
            <AccountSummary accounts={accounts}></AccountSummary>
          </div>


          <div className="col-12 md:col-8">
            <Card title={getChartTitle('Spending by Category (All Accounts)', effectiveYear, effectiveMonth)}>
              {spendingByCategoryAll.length === 0 ? (
                  <div className="text-center">No spending in this period.</div>
              ) : (
                  <ul className="list-none p-0 m-0">
                    {spendingByCategoryAll.map(([cat, amt]) => {
                      const pct = totalSpendingAllAccounts > 0 ? (amt / totalSpendingAllAccounts) * 100 : 0;
                      return (
                          <li key={cat}
                              className="flex justify-content-between align-items-center py-1 border-bottom-1 border-gray-200">
                            <span>{cat}</span>
                            <span className="font-bold">
                    {formatCurrency(amt)} <small className="text-500">({pct.toFixed(1)}%)</small>
                  </span>
                          </li>
                      );
                    })}
                  </ul>
              )}
            </Card>
          </div>
        </div>
      </div>


      {selectedAccount && (
          <>

            <div className="col-12 md:col-6 lg:col-8">
            <div className="grid">

              <div className="col-12 md:col-6">
                <Card title="Filtri">
                  <div className="flex flex-column gap-2 align-items-start">
                    <span>Year:</span>
                    <Dropdown value={selectedYear} options={yearOptions} onChange={e => setSelectedYear(e.value)} optionLabel="label" className="w-10rem mb-2" />
                    <span>Month:</span>
                    <Dropdown value={selectedMonth} options={monthNames} onChange={e => setSelectedMonth(e.value)} optionLabel="label" className="w-10rem mb-2" />
                    <Button label="Clear" icon="pi pi-times" className="p-button-text mt-2" onClick={() => { setSelectedYear(currentYear); setSelectedMonth(currentMonth); }} />
                  </div>
                </Card>
              </div>

              <div className="col-12 md:col-6">
                <Card title={getChartTitle('Top Categories', effectiveYear, effectiveMonth)}>
                  <div className="mb-3">
                    <strong>Top Spending Categories</strong>
                    {topSpendingCategories.length === 0 ? (
                      <div className="text-center">No spending for this filter.</div>
                    ) : (
                      <ul className="list-none p-0 m-0">
                        {topSpendingCategories.map(([cat, amt]) => (
                          <li key={cat} className="flex justify-content-between py-1 border-bottom-1 border-gray-200">
                            <span>{cat}</span>
                            <span className="font-bold">{formatCurrency(amt)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <strong>Top Income Sources</strong>
                    {topIncomeSources.length === 0 ? (
                      <div className="text-center">No income for this filter.</div>
                    ) : (
                      <ul className="list-none p-0 m-0">
                        {topIncomeSources.map(([cat, amt]) => (
                          <li key={cat} className="flex justify-content-between py-1 border-bottom-1 border-gray-200">
                            <span>{cat}</span>
                            <span className="font-bold">{formatCurrency(amt)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6 lg:col-8">
            <div className="grid h-full">
              <div className="col-12 md:col-4 flex">
                <Card title={getChartTitle('Income', effectiveYear, effectiveMonth)} className="w-full">
                <div className="text-2xl font-bold text-green-600 mb-1">{formatCurrency(incomeThisMonth)}</div>
                  <div className={incomeThisMonth > 0 ? 'text-green-500' : incomeThisMonth < 0 ? 'text-red-500' : ''}>
                  </div>
                </Card>
              </div>
              <div className="col-12 md:col-4 flex">
                <Card title={getChartTitle('Expenses', effectiveYear, effectiveMonth)} className="w-full">
                <div className="text-2xl font-bold text-red-600 mb-1">{formatCurrency(expensesThisMonth)}</div>
                  <div className={expensesThisMonth > 0 ? 'text-red-500' : expensesThisMonth < 0 ? 'text-green-500' : ''}>
                  </div>
                </Card>
              </div>
              <div className="col-12 md:col-4 flex gap-2">
                <Card title={getChartTitle('Net Savings', effectiveYear, effectiveMonth)} className="w-full">
                <div className={netSavingsThisMonth >= 0 ? 'text-2xl font-bold text-green-700' : 'text-2xl font-bold text-red-700'}>
                    {formatCurrency(netSavingsThisMonth)}
                  </div>
                </Card>

                <Card>
                  <p className="text-lg font-bold">Available Actions</p>
                  <div className="flex gap-2 mt-2">
                    <Button label="Deposit" icon="pi pi-arrow-down"
                            onClick={() => {
                              setNewTransaction({type: TransactionType.Deposit, amount: 0, description: ''});
                              setShowTransactionDialog(true);
                            }}/>
                    <Button label="Withdraw" icon="pi pi-arrow-up" className="p-button-secondary"
                            onClick={() => {
                              setNewTransaction({type: TransactionType.Withdrawal, amount: 0, description: ''});
                              setShowTransactionDialog(true);
                            }}/>
                    <Button label="Transfer" icon="pi pi-send" className="p-button-info"
                            onClick={() => setShowTransferDialog(true)}
                            disabled={accounts.length < 2}/>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <div className="col-12">
            <Card title={getChartTitle('Recent Transactions', effectiveYear, effectiveMonth)}
                  subTitle={`for ${selectedAccount.name} Account #${String(selectedAccount?.id).substring(0, 8)}`}>
              {filteredTransactions.length === 0 ? (
                  <div className="p-4 text-center">
                    <p>No transactions found for this account.</p>
                  </div>
              ) : (
                  (() => {
                    const startingBalance = selectedAccount?.balance || 0;
                    const runningBalances = getRunningBalances(filteredTransactions, startingBalance);
                    return (
                        <DataTable
                            value={filteredTransactions}
                            lazy
                            paginator
                            first={(currentPage - 1) * rows}
                            rows={rows}
                            totalRecords={totalRecords}
                            onPage={onPageChange}
                            loading={accountsLoading}
                        dataKey="id"
                        emptyMessage="No transactions found"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} transactions"
                        rowsPerPageOptions={[5, 10, 25]}
                      >
                        <Column field="type" header="Type"/>
                        <Column field="category" header="Category" body={categoryTemplate} style={{minWidth: '8rem'}}/>
                        <Column field="amount" header="Amount" body={amountTemplate} style={{ minWidth: '8rem' }}></Column>
                        <Column field="date" header="Date" body={transactionDateTemplate}/>
                        <Column field="description" header="Description"/>
                      </DataTable>
                    );
                  })()
              )}
            </Card>
          </div>
        </>
      )}

        <Dialog visible={showAccountDialog} style={{width: '450px'}} header="Create New Account"
                footer={accountDialogFooter} onHide={() => setShowAccountDialog(false)}>
          <div className="field">
            <label htmlFor="accountType" className="font-bold">Account Type</label>
            <Dropdown id="accountType" value={newAccount.type} options={accountTypes}
                      onChange={(e) => setNewAccount({...newAccount, type: e.value})}
                      placeholder="Select Account Type"
                      className={classNames({'p-invalid': submitted && !newAccount.type})}/>
            {submitted && !newAccount.type && <small className="p-error">Account type is required.</small>}
          </div>
        </Dialog>

        <TransactionDialog
            visible={showTransactionDialog}
            transaction={newTransaction}
            transactionDate={transactionDate}
            transactionTypes={transactionTypes}
            categories={categories}
            submitted={submitted}
            footer={transactionDialogFooter}
            onHide={() => setShowTransactionDialog(false)}
            onDropdownChange={onDropdownChange}
            onAmountChange={onAmountChange}
            onCalendarChange={onCalendarChange}
            onInputChange={onInputChange}
            hideTypeSelector={true}
        />

        <TransferDialog
            visible={showTransferDialog}
            accounts={accounts}
            fromAccountId={selectedAccount?.id}
            onHide={() => setShowTransferDialog(false)}
            onTransferComplete={() => {
              if (selectedAccount) {
                reloadTransactions(selectedAccount.id);
              }
            }}
        />
      </div>
  );
};

export default Dashboard; 