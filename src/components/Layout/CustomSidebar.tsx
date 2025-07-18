import React from "react";
import {Menu} from "primereact/menu";
import AuthService from "../../services/auth/auth.service";
import {useNavigate} from "react-router-dom";
import {Sidebar} from "primereact/sidebar";
import {getUserMenuItems} from "./userMenuItems";
interface SidebarProps {
    sidebarVisible: boolean;
    setSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
const CustomSidebar: React.FC<SidebarProps> = ( {sidebarVisible, setSidebarVisible}) => {
    const navigate = useNavigate();

    const userMenuItems = getUserMenuItems(navigate)

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