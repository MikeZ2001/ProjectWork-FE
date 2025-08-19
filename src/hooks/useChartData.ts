import { useMemo } from 'react';
import { Transaction } from '@models/transaction';
import { TransactionType } from 'types/models/transaction/enums/transaction.type';
import { getMonthFromDate } from '../utils/dateUtils';

export function useOutcomeChartData(transactions: Transaction[]) {
  return useMemo(() => {
    const withdrawals = transactions.filter(t => t.type === TransactionType.Withdrawal);
    const byCat: Record<string, number> = {};
    withdrawals.forEach(transaction => {
      const name = transaction.category?.name ?? 'Uncategorized';
      byCat[name] = (byCat[name] || 0) + (transaction.amount ?? 0);
    });
    const labels = Object.keys(byCat);
    const data = labels.map(l => byCat[l]);
    return {
      data: { labels, datasets: [{ data }] },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: { display: true, text: 'Spending by Category' }
        }
      }
    };
  }, [transactions]);
}

export function useIncomeChartData(transactions: Transaction[]) {
  return useMemo(() => {
    const deposits = transactions.filter(t => t.type === TransactionType.Deposit);
    const byCat: Record<string, number> = {};
    deposits.forEach(transaction => {
      const name = transaction.category?.name ?? 'Uncategorized';
      byCat[name] = (byCat[name] || 0) + (transaction.amount ?? 0);
    });
    const labels = Object.keys(byCat);
    const data = labels.map(l => byCat[l]);
    return {
      data: { labels, datasets: [{ data }] },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: { display: true, text: 'Income by Category' }
        }
      }
    };
  }, [transactions]);
}

export function useBalanceChartData(transactions: Transaction[]) {
  return useMemo(() => {
    if (transactions.length === 0) {
      return { data: { labels: [], datasets: [] }, options: {} };
    }
    type MonthAgg = { income: number; expense: number };
    const monthly = transactions.reduce<Record<string, MonthAgg>>((acc, t) => {
      const month = getMonthFromDate(t.transaction_date);
      if (!acc[month]) acc[month] = { income: 0, expense: 0 };
      if (t.type === TransactionType.Deposit) {
        acc[month].income += t.amount ?? 0;
      } else if (t.type === TransactionType.Withdrawal) {
        acc[month].expense += t.amount ?? 0;
      }
      return acc;
    }, {});
    const sortedMonths = Object.keys(monthly)
      .sort((a, b) => new Date(a + '-01').getTime() - new Date(b + '-01').getTime())
      .slice(-6);
    const incomeData = sortedMonths.map(m => monthly[m].income);
    const expenseData = sortedMonths.map(m => monthly[m].expense);
    return {
      data: {
        labels: sortedMonths,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: '#023453',
            borderColor: '#02E563',
            tension: 0.4
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: '#012389',
            borderColor: '#02E563',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Account Activity' }
        }
      }
    };
  }, [transactions]);
} 