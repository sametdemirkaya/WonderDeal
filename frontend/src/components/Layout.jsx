import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import PlayerSlideOver from './PlayerSlideOver';
import { useScoutStore } from '../store/useScoutStore';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { globalSlideOverPlayer, setGlobalSlideOverPlayer } = useScoutStore();

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className={`${isCollapsed ? 'pl-20' : 'pl-60'} min-h-screen flex flex-col bg-surface transition-all duration-300`}>
        
        {/* Top Header Bar - Centered */}
        <header className="h-[72px] w-full flex items-center justify-center px-8 bg-surface/90 backdrop-blur-md border-b border-outline-variant/20 sticky top-0 z-40">
          <div className="w-full max-w-2xl">
            <GlobalSearch />
          </div>
        </header>

        <main className="w-full flex-1 bg-surface">
          <Outlet />
        </main>
      </div>

      {/* Global Slide Over */}
      <PlayerSlideOver 
        isOpen={!!globalSlideOverPlayer} 
        onClose={() => setGlobalSlideOverPlayer(null)} 
        player={globalSlideOverPlayer} 
      />
    </div>
  );
};

export default Layout;
