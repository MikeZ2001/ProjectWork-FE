import React from "react";
import {Menu} from "primereact/menu";
import AuthService from "../../services/auth.service";
import {useNavigate} from "react-router-dom";
import {Sidebar} from "primereact/sidebar";
interface SidebarProps {
    sidebarVisible: boolean;
    setSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
const CustomSidebar: React.FC<SidebarProps> = ( {sidebarVisible, setSidebarVisible}) => {
    const navigate = useNavigate();

    const userMenuItems = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            command: () => navigate('/dashboard')
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

    return (
        <div>
            <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)} className="p-sidebar-md">
                <div className="flex flex-column h-full">

                    <div className="flex-grow-1">
                        <Menu model={userMenuItems} className="w-full border-none" />
                    </div>
                </div>
            </Sidebar>
        </div>
    );
}

export default CustomSidebar;