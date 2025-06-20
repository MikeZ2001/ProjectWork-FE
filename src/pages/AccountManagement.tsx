import React, {useEffect, useRef, useState} from "react";
import {Account} from "@models/account";

import {Toast} from "primereact/toast";
import AccountService from "../services/account/account.service";
import {Button} from "primereact/button";
import {DataTable} from "primereact/datatable";
import {AccountType} from 'types/models/account/enums/account.type';
import {AccountStatus} from "types/models/account/enums/account.status";
import {Column} from "primereact/column";

const AccountManagement: React.FC = () => {

    const [accounts, setAccounts] = useState<Account[]>([])
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [account, setAccount] = useState<Partial<Account>>( {
        type: AccountType.Checking,
        balance: 0,
        status: AccountStatus.Active
    })

    const accountTypeTemplate = (rowData: Account) => {
        const accountType = rowData.type || (rowData as any).type || 'unknown';
        return accountType.charAt(0).toUpperCase() + accountType.slice(1)
    }

    const openNew = () => {
    }

    useEffect(() => {
        loadAccounts();
    }, []);

    async function loadAccounts() {
        try {
            setLoading(true);
            const accounts = await AccountService.getAccounts();
            console.log(accounts)
            setAccounts(accounts);
        } catch (error: any) {
            console.error('Error loading accounts', error);
            toast.current?.show({severity: 'error', summary: 'Error', detail: 'Failed to load accounts', life: 3000});
        } finally {
            setLoading(false);
        }
    }

    return (
      <div>
          <Toast ref={toast} />
          <div className="flex justify-content-between align-items-center mb-3">
              <h1 className="m-0">Accounts</h1>
              <Button label="New Index" icon="pi pi-plus" className="p-button-success" onClick={openNew}></Button>
          </div>

          <DataTable
              value={accounts}
              selection={selectedAccount}
              onSelectionChange={(e) => setSelectedAccount(e.value as Account)}
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[5,10,15]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} accounts"
              loading={loading}
              emptyMessage="No accounts found"
              className="p-datatable-sm"
            >

              <Column selectionMode="single" style={{width: '3erm'}}></Column>
              <Column field="id" header="id" sortable style={{minWidth: '5rem'}}></Column>
              <Column field="type" header="type" body={accountTypeTemplate} sortable style={{minWidth: '10rem'}}></Column>
          </DataTable>
      </div>
    );
}

export default AccountManagement;