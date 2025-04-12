import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';
import AuthService from '../../services/auth.service';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  const user = AuthService.getCurrentUser();
  
  const menuItems = [
    {
      label: 'Project Work App',
      icon: 'pi pi-money-bill',
      command: () => navigate('/dashboard')
    }
  ];
  
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
    <Button 
      label="Login" 
      icon="pi pi-sign-in" 
      onClick={() => navigate('/login')} 
    />
  );
  
  return (
    <div className="min-h-screen flex flex-column">
      <Menubar model={menuItems} start={start} end={end} className="shadow-2" />
      
      <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)} className="p-sidebar-md">
        <div className="flex flex-column h-full">

          <div className="flex-grow-1">
            <Menu model={userMenuItems} className="w-full border-none" />
          </div>
        </div>
      </Sidebar>
      
      <div className="flex-grow-1 p-4">
        <Outlet />
      </div>
      
      <div className="text-center p-3 border-top-1 surface-border">
        <p className="text-sm text-color-secondary m-0">
          Project Work App © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Layout; 