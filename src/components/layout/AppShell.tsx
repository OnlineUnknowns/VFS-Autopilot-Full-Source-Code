import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../../lib/utils';

export const AppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas-base text-text-primary select-none">
      {/* Pinned Left Collapsible Navigation Drawer */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Panel Viewport */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        {/* Top Header Bar */}
        <Header />

        {/* Scrollable Container Page Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-canvas-base scrollbar-thin">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
