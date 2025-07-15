import { useState, useEffect, useCallback } from 'react';
import TransactionService from '../services/transaction/transaction.service';
import { Transaction } from '@models/transaction';

export function useTransactions(accountId?: number, page = 1, perPage = 10) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const reloadTransactions = useCallback(async (id = accountId, p = page, pp = perPage) => {
    if (!id) return;
    try {
      const res = await TransactionService.getTransactions(id, p, pp);
      setTransactions(res.data);
      setTotalRecords(res.total);
    } catch (e) {
      // handle error
    }
  }, [accountId, page, perPage]);

  useEffect(() => {
    if (!accountId) return;
    reloadTransactions(accountId, page, perPage);
  }, [accountId, page, perPage, reloadTransactions]);

  return { transactions, totalRecords, setTransactions, reloadTransactions };
} 