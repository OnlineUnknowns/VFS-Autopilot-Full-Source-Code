import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme, Language } from '../../context/ThemeContext';
import { useNotificationsStore } from '../../store/notificationsStore';
import { Button } from '../ui/Button';

// Self-contained Icon SVGs
const SunIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const BellIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export const Header: React.FC = () => {
  const { t, language, setLanguage, theme, toggleTheme, direction } = useTheme();
  const location = useLocation();
  const unreadCount = useNotificationsStore((state) => state.logs.filter((log) => !log.read).length);

  // Derive page title from routing path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.endsWith('/countries')) return t('sidebar.countries');
    if (path.endsWith('/bookings')) return t('sidebar.bookings');
    if (path.endsWith('/notifications')) return t('sidebar.notifications');
    if (path.endsWith('/settings')) return t('sidebar.settings');
    return t('sidebar.dashboard');
  };

  return (
    <header className="h-16 border-b border-border-default flex items-center justify-between px-6 bg-canvas-base shrink-0 select-none z-10">
      {/* Title & Status Badge */}
      <div className="flex items-center gap-4">
        <h1 className="text-base font-bold tracking-tight text-text-primary">
          {getPageTitle()}
        </h1>
        

      </div>

      {/* Global Action Handlers */}
      <div className="flex items-center gap-3">
        {/* Unread Alerts Bell Trigger */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-9 w-9 rounded-lg border-border-default/40 text-text-secondary hover:text-text-primary hover:bg-canvas-secondary"
            aria-label="Notification Center"
          >
            <BellIcon />
          </Button>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -end-1 h-5 min-w-[20px] px-1 rounded-full bg-danger-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-canvas-base animate-pulse shadow-sm shadow-danger-500/30">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Dynamic Dark / Light toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2 h-9 w-9 rounded-lg border-border-default/40 text-text-secondary hover:text-text-primary hover:bg-canvas-secondary"
          aria-label="Toggle Color Theme"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </Button>

        {/* Global Translation Language Select Dropdown */}
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-canvas-secondary border border-border-default/60 rounded-lg text-xs font-semibold text-text-primary px-2.5 py-1.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
            aria-label="Select Interface Language"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="ar">AR</option>
          </select>
        </div>
      </div>
    </header>
  );
};
