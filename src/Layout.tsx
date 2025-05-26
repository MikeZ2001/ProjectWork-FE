import { Outlet } from 'react-router-dom';
import React, { useState } from 'react';
import TopBar from "./components/Layout/TopBar";
import CustomSidebar from "./components/Layout/CustomSidebar";

const Layout: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <div className="min-h-screen flex flex-column">
      <TopBar
       setSidebarVisible={setSidebarVisible}/>
      
      <CustomSidebar
          sidebarVisible={sidebarVisible}
          setSidebarVisible={setSidebarVisible}
      />

      <div className="flex-grow-1 p-4">
        <Outlet />
      </div>

      <footer className="text-center p-3 border-top-1 surface-border">
        <p className="text-sm text-color-secondary m-0">
          Project Work App © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default Layout; 