import React from "react";
import {Button} from "primereact/button";
import {Avatar} from "primereact/avatar";
import {useNavigate} from "react-router-dom";

import {Toolbar} from "primereact/toolbar";
import { useAuth } from "../../contexts/AuthContext";

interface TopBarProps {
    setSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
const TopBar: React.FC<TopBarProps> = ({setSidebarVisible}) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const start = (
        <Button
            icon="pi pi-bars"
            className="p-button-rounded p-button-text mr-2"
            onClick={() => setSidebarVisible(true)}
        />
    );

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const end = user ? (
        <div className="flex align-items-center gap-2">
            <span className="font-bold hidden md:block">
                {user.first_name} {user.last_name}
            </span>
            <Avatar icon="pi pi-user" size="large" shape="circle" />
            <Button 
                icon="pi pi-sign-out" 
                className="p-button-rounded p-button-text p-button-sm"
                onClick={handleLogout}
                tooltip="Logout"
            />
        </div>
    ) : (
        <Avatar icon="pi pi-user" size="xlarge" />
    );

    // Redirect to login if not authenticated
    React.useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    return (
        <div>
            <Toolbar start={start} end={end} className="shadow-2" />
        </div>
    );
};

export default TopBar;