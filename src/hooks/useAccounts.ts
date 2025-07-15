import { useState, useEffect } from 'react';
import AccountService from '../services/account/account.service';
import { Account } from '@models/account';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      setLoading(true);
      try {
        const res = await AccountService.getAccounts();
        setAccounts(res.data);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  return { accounts, loading, setAccounts };
} 