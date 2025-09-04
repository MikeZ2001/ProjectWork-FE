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

type UseTxResult = {
  transactions: Transaction[];
  loading: boolean;
  error: unknown | null;
};

export function useAllTransactionsByAuthUser(): UseTxResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    TransactionService.getAllTransactionsByAuthUser()
        .then(res => {
          if (!cancelled) setTransactions(res.data);
        })
        .catch(err => {
          if (!cancelled) setError(err);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

    // 👇 IMPORTANT: empty dependency array so it runs once on mount
    return () => {
      cancelled = true;
    };
  }, []);

  return { transactions, loading, error };
}