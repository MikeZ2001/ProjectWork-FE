import React, {useEffect, useState} from "react";
import {Button} from "primereact/button";
import {Avatar} from "primereact/avatar";
import {useNavigate} from "react-router-dom";
import {User} from "@models/user";

import {Toolbar} from "primereact/toolbar";
import UserService from "../../services/user/user.service";
import AuthService from "../../services/auth/auth.service";

interface TopBarProps {
    setSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
const TopBar: React.FC<TopBarProps> = ({setSidebarVisible}) => {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);

    const start = (
        <Button
            icon="pi pi-bars"
            className="p-button-rounded p-button-text mr-2"
            onClick={() => setSidebarVisible(true)}
        />
    );

    const end = user ? (
        <div className="flex align-items-center gap-2">
      <span className="font-bold hidden md:block">
        {user.first_name} {user.last_name}
      </span>
            <Avatar icon="pi pi-user" size="large" shape="circle" />
        </div>
    ) : (
        <Avatar icon="pi pi-user" size="xlarge" />
    );

    useEffect(() => {
        async function fetchUser() {
            try {
                const currentUser = await UserService.getCurrentUser();
                if (!currentUser) {
                    navigate('/login');
                }
                setUser(currentUser);
            } catch {
                AuthService.logout();
                navigate('/login');
            }
        }
        fetchUser()
    }, [navigate]);

    return (
        <div>
            <Toolbar start={start} end={end} className="shadow-2" />
        </div>
    );
};

export default TopBar;