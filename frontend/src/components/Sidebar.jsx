import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Compass, Search, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'; // Using Lucide React

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <aside className={`fixed left-0 top-0 bottom-0 ${isCollapsed ? 'w-20' : 'w-60'} z-50 flex flex-col justify-between bg-surface-container-low border-r border-outline-variant/30 transition-all duration-300`}>
      <div className="flex flex-col w-full">
        <div className="h-16 px-space-base flex items-center justify-between border-b border-outline-variant/20 overflow-hidden">
          <Link to="/" className="flex-1 flex items-center justify-start hover:text-primary transition-colors cursor-pointer truncate" title="Go to Home">
            {!isCollapsed ? (
              <span className="font-display font-bold text-xl tracking-tight text-white truncate transition-opacity duration-300">WonderDeal</span>
            ) : (
              <span className="font-display font-bold text-xl tracking-tight text-primary">W</span>
            )}
          </Link>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 ml-2 bg-surface-container hover:bg-surface-variant rounded-md text-outline hover:text-on-surface transition-colors flex-shrink-0"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        <div className="pt-space-md pb-space-xs">
          {/* Removed Intelligence Workspace text */}
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {/* Removed Discover Link */}
          <NavLink 
            to="/scout" 
            title="Scout"
            className={({ isActive }) => 
              `relative flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-space-sm px-space-md py-space-sm'} rounded-lg transition-all font-display font-medium text-base ${
                isActive 
                  ? "bg-secondary-container text-on-surface font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-primary-container before:rounded-r" 
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`
            }
          >
            <Search className="w-[18px] h-[18px] text-outline flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Scout</span>}
          </NavLink>
          <NavLink 
            to="/h2h" 
            title="Compare (1v1)"
            className={({ isActive }) => 
              `relative flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-space-sm px-space-md py-space-sm'} rounded-lg transition-all font-display font-medium text-base ${
                isActive 
                  ? "bg-secondary-container text-on-surface font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-primary-container before:rounded-r" 
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`
            }
          >
            <Compass className="w-[18px] h-[18px] text-outline flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Compare (1v1)</span>}
          </NavLink>
          <NavLink 
            to="/shortlist" 
            title="Shortlist"
            className={({ isActive }) => 
              `relative flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-space-sm px-space-md py-space-sm'} rounded-lg transition-all font-display font-medium text-base ${
                isActive 
                  ? "bg-secondary-container text-on-surface font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-primary-container before:rounded-r" 
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`
            }
          >
            <Bookmark className="w-[18px] h-[18px] text-outline flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Shortlist</span>}
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
