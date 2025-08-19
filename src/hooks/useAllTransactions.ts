import { useState, useEffect } from 'react';
import TransactionService from '../services/transaction/transaction.service';
import { Transaction } from '@models/transaction';

export function useAllTransactions(accountId?: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) {
      setTransactions([]);
      return;
    }
    setLoading(true);
    TransactionService.getTransactions(accountId, 1, 10000)
      .then(res => setTransactions(res.data))
      .finally(() => setLoading(false));
  }, [accountId]);

  return { transactions, loading };
} 