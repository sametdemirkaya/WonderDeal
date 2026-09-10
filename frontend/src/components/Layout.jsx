import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`${isCollapsed ? 'pl-20' : 'pl-60'} min-h-screen flex flex-col bg-surface transition-all duration-300`}>
        <main className="w-full pt-16 flex-1 bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
