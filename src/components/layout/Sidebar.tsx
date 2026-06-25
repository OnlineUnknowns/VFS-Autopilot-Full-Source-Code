import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

// Self-contained high-fidelity SVG icon representations
const HomeIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const GlobeIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2m-4-3.5a3.375 3.375 0 00-6.75 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const BellIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const SettingsIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);


interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { direction, t } = useTheme();

  const navItems = [
    { to: '/dashboard', end: true, labelKey: 'sidebar.dashboard', icon: <HomeIcon /> },
    { to: '/dashboard/countries', labelKey: 'sidebar.countries', icon: <GlobeIcon /> },
    { to: '/dashboard/bookings', labelKey: 'sidebar.bookings', icon: <CalendarIcon /> },
    { to: '/dashboard/notifications', labelKey: 'sidebar.notifications', icon: <BellIcon /> },
    { to: '/dashboard/settings', labelKey: 'sidebar.settings', icon: <SettingsIcon /> },
  ];

  return (
    <aside
      className={cn(
        'flex flex-col justify-between border-e border-border-default bg-canvas-secondary transition-all duration-300 ease-out shrink-0 relative select-none h-screen z-20',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center border-b border-border-default/50 px-4 justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-primary-500/30 shrink-0 animate-pulse-subtle">
                V
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight leading-none text-text-primary truncate">Velix Global</span>
                <span className="text-[10px] text-text-muted mt-0.5 leading-none font-semibold truncate">VFS Automation</span>
              </div>
            </div>
          ) : (
            <div className="h-8 w-8 mx-auto rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-primary-500/30 shrink-0">
              V
            </div>
          )}

          {/* Collapse toggle button */}
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-canvas-tertiary transition-all"
              aria-label="Collapse Sidebar"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                {direction === 'ltr' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Navigation lists */}
        <nav className="p-3 space-y-1">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all group duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400'
                    : 'text-text-secondary hover:text-text-primary hover:bg-canvas-tertiary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'shrink-0 transition-transform duration-200 group-hover:scale-105',
                      isActive ? 'text-primary-500' : 'text-text-muted group-hover:text-text-primary'
                    )}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="truncate">{t(item.labelKey)}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Pinned Bottom Expand Toggle */}
      <div className="p-3 border-t border-border-default/50 bg-canvas-secondary/50">
        <button
          onClick={onToggleCollapse}
          className="w-full flex justify-center p-3 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas-tertiary transition-all"
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            {collapsed ? (
              direction === 'ltr' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              )
            ) : (
              direction === 'ltr' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              )
            )}
          </svg>
        </button>
      </div>
    </aside>
  );
};
