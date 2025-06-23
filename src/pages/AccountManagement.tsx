import React, {useEffect, useRef, useState} from "react";
import {Account} from "@models/account";

import {Toast} from "primereact/toast";
import AccountService from "../services/account/account.service";
import {Button} from "primereact/button";
import {DataTable} from "primereact/datatable";
import {AccountType} from 'types/models/account/enums/account.type';
import {AccountStatus} from "types/models/account/enums/account.status";
import {Column} from "primereact/column";
import {Dialog} from "primereact/dialog";

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
    const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rows, setRows] = useState<number>(10);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const accountTypeTemplate = (rowData: Account) => {
        const accountType = rowData.type || (rowData as any).type || 'unknown';
        return accountType.charAt(0).toUpperCase() + accountType.slice(1)
    }

    const balanceTemplate = (rowData: Account) => {
        return rowData.balance;
    };

    const actionBodyTemplate = (rowData: Account) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDeleteAccount(rowData)} />
            </div>
        );
    };

    const statusTemplate = (rowData: Account) => {
        const status = rowData.status || (rowData as any).status || 'unknown';
        return (
            <span className={`p-tag p-tag-${status ===  AccountStatus.Active.toString() ? 'success' : status === AccountStatus.Inactive.toString() ? 'warning' : 'danger'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
        );
    };

    const confirmDeleteAccount = (account: Account) => {
        setAccount(account);
        setDeleteAccountDialog(true);
    };

    const hideDeleteAccountDialog = () => {
        setDeleteAccountDialog(false);
    };

    const deleteAccount = async () => {
        try {
            if (account.id) {
                await AccountService.deleteAccount(account.id);
                const updatedAccounts = accounts.filter(a => a.id !== account.id);
                setAccounts(updatedAccounts);
                setDeleteAccountDialog(false);
                setAccount({});
                loadAccounts(currentPage, rows)
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Account Deleted', life: 3000 });
            }
        } catch (error) {
            console.error('Error deleting account', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete account', life: 3000 });
        }
    };

    const deleteAccountDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteAccountDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-danger" onClick={deleteAccount} />
        </>
    );

    const openNew = () => {
    }

    useEffect(() => {
        loadAccounts(currentPage, rows);
    }, []);

    async function loadAccounts(page = 1, perPage = 10) {
        try {
            setLoading(true);
            const accounts = await AccountService.getAccounts(page, perPage);
            console.log(accounts)
            setAccounts(accounts.data);
            setTotalRecords(accounts.total)
        } catch (error: any) {
            console.error('Error loading accounts', error);
            toast.current?.show({severity: 'error', summary: 'Error', detail: 'Failed to load accounts', life: 3000});
        } finally {
            setLoading(false);
        }
    }

    const onPageChange = async (event: any) => {
        const newPage = Math.floor(event.first / event.rows) + 1;
        setRows(event.rows);
        setCurrentPage(newPage);
        await loadAccounts(newPage, event.rows)
    };

    return (
      <div>
          <Toast ref={toast} />
          <div className="flex justify-content-between align-items-center mb-3">
              <h1 className="m-0">Accounts</h1>
              <Button label="New Index" icon="pi pi-plus" className="p-button-success" onClick={openNew}></Button>
          </div>

          <DataTable
              value={accounts}
              lazy
              paginator
              first={(currentPage - 1) * rows}
              rows={rows}
              totalRecords={totalRecords}
              onPage={onPageChange}
              loading={loading}
              dataKey="id"
              emptyMessage="No accounts found"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} accounts"
              rowsPerPageOptions={[5, 10, 15]}
          >

              <Column selectionMode="single" style={{width: '3erm'}}></Column>
              <Column field="id" header="id" sortable style={{minWidth: '5rem'}}></Column>
              <Column field="type" header="type" body={accountTypeTemplate} sortable style={{minWidth: '10rem'}}></Column>
              <Column field="balance" header="Balance" body={balanceTemplate} sortable style={{minWidth: '8rem'}}></Column>
              <Column field="status" header="Status" body={statusTemplate} sortable style={{minWidth: '8rem'}}></Column>
              <Column body={actionBodyTemplate} style={{width: '8rem'}}></Column>
          </DataTable>

          <Dialog
              visible={deleteAccountDialog}
              style={{ width: '450px' }}
              header="Confirm"
              modal
              footer={deleteAccountDialogFooter}
              onHide={hideDeleteAccountDialog}
          >
              <div className="confirmation-content">
                  <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                  {account && <span>Are you sure you want to delete this account?</span>}
              </div>
          </Dialog>
      </div>
    );
}

export default AccountManagement;