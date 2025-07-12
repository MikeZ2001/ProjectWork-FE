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
import {Dropdown} from "primereact/dropdown";
import {InputNumber} from "primereact/inputnumber";
import {Calendar} from "primereact/calendar";
import {InputText} from "primereact/inputtext";

const AccountManagement: React.FC = () => {

    const [accounts, setAccounts] = useState<Account[]>([])
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
    const [submitted, setSubmitted] = useState(false);
    const [accountDialog, setAccountDialog] = useState(false);
    const [openDate, setOpenDate] = useState<Date|null|undefined>(new Date());
    const [closeDate, setCloseDate] = useState<Date|null|undefined>(null);

    useEffect(() => {
        if (closeDate) {
            setAccount(prev => ({
                ...prev,
                status: AccountStatus.Closed
            }));
        }
    }, [closeDate]);

    const hideDialog = () => {
        setSubmitted(false);
        setAccountDialog(false);
    };

    const editAccount = (account: Account) => {
        setAccount({...account});
        setAccountDialog(true);
    };

    const onAmountChange = (e: any, name: string) => {
        const val = e.value || 0;
        setAccount(prevAccount => ({
            ...prevAccount,
            [name]: val
        }));
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = e.target.value;
        setAccount(prevAccount => ({
            ...prevAccount,
            [name]: val
        }));
    };

    const onDropdownChange = (e: { value: any }, name: string) => {
        const val = e.value;
        setAccount(prevAccount => ({
            ...prevAccount,
            [name]: val
        }));
    };

    const onStatusChange = (e: { value: any }) => {
        const newStatus = e.value as AccountStatus;
        setAccount(prev => ({ ...prev, status: newStatus }));

        if (newStatus !== AccountStatus.Closed) {
            setCloseDate(null);
        }
    };

    const accountTypeTemplate = (rowData: Account) => {
        const accountType = rowData.type || (rowData as any).type || 'unknown';
        return accountType.charAt(0).toUpperCase() + accountType.slice(1)
    }

    const balanceTemplate = (rowData: Account) => {
        return rowData.balance;
    };

    const accountTypes = [
        { label: 'Checking', value: AccountType.Checking.toString() },
        { label: 'Savings', value: AccountType.Savings.toString() },
        { label: 'Investment', value: AccountType.Investment.toString() },
        { label: 'Cash', value: AccountType.Cash.toString() }
    ];

    const statusOptions = [
        { label: 'Active', value: AccountStatus.Active.toString() },
        { label: 'Inactive', value: AccountStatus.Inactive.toString() },
        { label: 'Closed', value: AccountStatus.Closed.toString() }
    ];

    const actionBodyTemplate = (rowData: Account) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-button-sm" onClick={() => editAccount(rowData)} />
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

    const openDateTemplate = (rowData: Account) => {
        return rowData.open_date.split(' ')[0];
    };

    const closeDateTemplate = (rowData: Account) => {
        return rowData.close_date?.split(' ')[0] ?? null;
    };

    const confirmDeleteAccount = (account: Account) => {
        setAccount(account);
        setDeleteAccountDialog(true);
    };

    const hideDeleteAccountDialog = () => {
        setDeleteAccountDialog(false);
    };

    const validateAccount = (account: Partial<Account>, openDate: Date|null|undefined, closeDate: Date|null|undefined) => {
        if (!account.type) {
            return 'Account type is required';
        }
        if (account.balance == null) {
            return 'Balance is required';
        }
        if (!openDate) {
            return 'Open date is required';
        }
        if (account.status === AccountStatus.Closed && !closeDate) {
            return 'You must select a closing date when status is Closed';
        }
        return null;
    };

    const saveAccount = async () => {
        setSubmitted(true);
        const error = validateAccount(account, openDate, closeDate);

        if (error)  {
            console.log(error);
            return;
        }

        try {
            account.open_date = openDate?.toISOString().split('T')[0];
            account.close_date = closeDate?.toISOString().split('T')[0] ?? null;

            const newAccount = await AccountService.createAccount(account);
            setAccounts([...accounts, newAccount]);
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Account Created', life: 3000 });
            setAccountDialog(false);
            setAccount({});
        } catch (error) {
            console.error('Error saving account', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save account', life: 3000 });
        }
    };

    const updateAccount = async () => {
        setSubmitted(true);
        const error = validateAccount(account, openDate, closeDate);
        if (error)  {
            console.log(error);
            return;
        }

        try {
            account.open_date = openDate?.toISOString().split('T')[0];
            account.close_date = closeDate?.toISOString().split('T')[0] ?? null;

            const updatedAccount = await AccountService.updateAccount(account.id, account);
            setAccounts(accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a));
            toast.current?.show({severity: 'success', summary: 'Success', detail: 'Account Updated', life: 3000});
            setAccountDialog(false);
            setAccount({});
        } catch (error) {
            console.error('Error updating account', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update account', life: 3000 });
        }
    }

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

    const accountDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button
                label="Save"
                icon="pi pi-check"
                onClick={() =>
                    account.id != null
                        ? updateAccount()
                        : saveAccount()
                }
            />

        </>
    );

    const deleteAccountDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteAccountDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-danger" onClick={deleteAccount} />
        </>
    );

    const openNew = () => {
        setAccount( {
            balance: 0,
            status: AccountStatus.Inactive
        })
        setSubmitted(false);
        setAccountDialog(true);
    }

    useEffect(() => {
        loadAccounts(currentPage, rows);
    }, []);

    async function loadAccounts(page = 1, perPage = 10) {
        try {
            setLoading(true);
            const accounts = await AccountService.getAccounts(page, perPage);
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
              <Button label="New Account" icon="pi pi-plus" className="p-button-success" onClick={openNew}></Button>
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
              <Column field="id" header="id" style={{minWidth: '5rem'}}></Column>
              <Column field="name" header="name" style={{minWidth: '5rem'}}></Column>
              <Column field="type" header="type" body={accountTypeTemplate} style={{minWidth: '10rem'}}></Column>
              <Column field="balance" header="Balance" body={balanceTemplate} style={{minWidth: '8rem'}}></Column>
              <Column field="status" header="Status" body={statusTemplate} style={{minWidth: '8rem'}}></Column>
              <Column field="open_date" header="Opening date" body={openDateTemplate} style={{minWidth: '8rem'}}></Column>
              <Column field="close_date" header="Closure date" body={closeDateTemplate} style={{minWidth: '8rem'}}></Column>
              <Column body={actionBodyTemplate} style={{width: '8rem'}}></Column>
          </DataTable>

          {/* Account Dialog */}
          <Dialog
              visible={accountDialog}
              style={{width: '450px'}}
              header={account.id ? "Edit Account" : "New Account"}
              modal
              className="p-fluid"
              footer={accountDialogFooter}
              onHide={hideDialog}
          >
              <div className="field">
                  <label htmlFor="name">Name</label>
                  <InputText
                      id="name"
                      value={account.name}
                      onChange={(e) => onInputChange(e, 'name')}
                      placeholder="Enter a name"
                      className={submitted && !account.name ? 'p-invalid' : ''}
                  />
                  {submitted && !account.name && <small className="p-error">Account name is required.</small>}
              </div>

              <div className="field">
                  <label htmlFor="accountType">Account Type</label>
                  <Dropdown
                      id="accountType"
                      value={account.type}
                      options={accountTypes}
                      onChange={(e) => onDropdownChange(e, 'type')}
                      placeholder="Select an Account Type"
                      className={submitted && !account.type ? 'p-invalid' : ''}
                  />
                  {submitted && !account.type && <small className="p-error">Account Type is required.</small>}
              </div>
              {account.id ? (
                  <div className="field">
                      <label htmlFor="balance">Balance</label>
                      <InputNumber
                          id="balance"
                          value={account.balance}
                          onValueChange={(e) => onAmountChange(e, 'balance')}
                          mode="currency"
                          currency="EUR"
                          locale="it-IT"
                          disabled
                      />
                  </div>
              ) : (
                  <div className="field">
                      <label htmlFor="balance">Initial Balance</label>
                      <InputNumber
                          id="balance"
                          value={account.balance}
                          onValueChange={(e) => onAmountChange(e, 'balance')}
                          mode="currency"
                          currency="EUR"
                          locale="it-IT"
                      />
                  </div>
              )}
              <div className="field">
                  <label htmlFor="status">Status</label>
                  <Dropdown
                      id="status"
                      value={account.status}
                      options={statusOptions}
                      onChange={onStatusChange}
                      placeholder="Select Status"
                  />
              </div>

              <div className="field">
                  <label htmlFor="open_date">Opening Date</label>
                  <Calendar
                      id="open_date"
                      value={openDate}
                      onChange={(e) => setOpenDate(e.value)}
                      dateFormat="yy-mm-dd"
                      showIcon
                      placeholder="YYYY-MM-DD"
                  />
              </div>

              <div className="field">
                  <label htmlFor="closure_date">Closure Date {account.status === AccountStatus.Closed &&
                      <span className="p-error">*</span>}</label>
                  <Calendar
                      id="closure_date"
                      value={closeDate}
                      onChange={(e) => setCloseDate(e.value)}
                      dateFormat="yy-mm-dd"
                      showIcon
                      placeholder="YYYY-MM-DD"
                      disabled={account.status !== AccountStatus.Closed}
                      required={account.status === AccountStatus.Closed}
                  />
                  {submitted && !account.close_date && account.status === AccountStatus.Closed && <small className="p-error">Account closure date is required.</small>}
              </div>
          </Dialog>

          <Dialog
              visible={deleteAccountDialog}
              style={{width: '450px'}}
              header="Confirm"
              modal
              footer={deleteAccountDialogFooter}
              onHide={hideDeleteAccountDialog}
          >
              <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{fontSize: '2rem'}}/>
                  {account && <span>Are you sure you want to delete this account?</span>}
              </div>
          </Dialog>
      </div>
    );
}

export default AccountManagement;