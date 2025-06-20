import {MenuItem} from "primereact/menuitem";
import AuthService from "../../services/auth/auth.service";

export const getUserMenuItems = (navigate: (path: string) => void): MenuItem[] => [
    {
        label: 'Dashboard',
        icon: 'pi pi-home',
        command: () => navigate('/dashboard')
    },
    {
        label: 'Accounts',
        icon: 'pi pi-wallet',
        command: () => navigate('/accounts')
    },
    {
        separator: true
    },
    {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
            AuthService.logout();
            navigate('/login');
        }
    }

];
