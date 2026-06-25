import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNotificationsStore, NotificationLog } from '../../store/notificationsStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export const Notifications: React.FC = () => {
  const { t, direction } = useTheme();
  const { logs, markAllRead, clearAll } = useNotificationsStore();

  // Filters State
  const [filterType, setFilterType] = useState<'all' | 'success' | 'error' | 'info'>('all');
  const [filterChannel, setFilterChannel] = useState<'all' | 'desktop' | 'telegram' | 'sound'>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesChannel = filterChannel === 'all' || log.channel === filterChannel;
    return matchesType && matchesChannel;
  });

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out_forwards]">
      
      {/* Page Header and bulk actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">
            {t('notifications_page.title') || 'Alert Notification logs'}
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Browse and debug alerts sent across system, sound, and Webhook Telegram channels.
          </p>
        </div>

        {logs.length > 0 && (
          <div className="flex gap-2.5 self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={markAllRead}
              className="text-xs h-9 font-semibold border-border-default hover:border-text-muted"
            >
              {t('notifications_page.mark_all_read') || 'Mark All as Read'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={clearAll}
              className="text-xs h-9 font-semibold border-transparent"
            >
              {t('notifications_page.clear_all') || 'Clear Logs'}
            </Button>
          </div>
        )}
      </div>

      {/* FILTER BAR BAR */}
      <Card className="border-border-default/60 shadow-sm text-start bg-canvas-secondary/15">
        <CardContent className="p-5 flex flex-wrap gap-4">
          {/* Channel Filter */}
          <div className="flex flex-col space-y-1.5 text-start w-full sm:w-48">
            <label className="text-xs font-semibold text-text-secondary">
              Notification Channel
            </label>
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value as any)}
              className="bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold text-text-primary px-3 py-2.5 focus:outline-none"
            >
              <option value="all">All Channels</option>
              <option value="desktop">Desktop Popups</option>
              <option value="telegram">Telegram Webhooks</option>
              <option value="sound">Sound Alarms</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex flex-col space-y-1.5 text-start w-full sm:w-48">
            <label className="text-xs font-semibold text-text-secondary">
              Alert Severity Level
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold text-text-primary px-3 py-2.5 focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="success">Success Events</option>
              <option value="error">Critical Errors</option>
              <option value="info">System Info Logs</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* CHRONOLOGICAL LOG FEED LIST */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center bg-canvas-secondary/15">
            <div className="h-12 w-12 rounded-full bg-canvas-tertiary flex items-center justify-center text-text-muted mb-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-text-primary">
              No Notification Triggers
            </h4>
            <p className="text-xs text-text-secondary mt-1 max-w-xs text-center leading-relaxed">
              Alert configurations have not triggered any notifications yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <Card 
                key={log.id} 
                className={`border-border-default/60 shadow-sm transition-all text-start relative overflow-hidden ${
                  !log.read ? 'ring-1 ring-primary-500 bg-primary-50/5 dark:bg-primary-950/5' : ''
                }`}
              >
                {/* Left borders indicating severity type */}
                <div className={`absolute top-0 bottom-0 w-1.5 ${
                  direction === 'rtl' ? 'right-0' : 'left-0'
                } ${
                  log.type === 'success' ? 'bg-primary-500' :
                  log.type === 'error' ? 'bg-danger-500' : 'bg-text-muted/60'
                }`} />

                <CardContent className="p-5 flex items-start gap-4">
                  {/* Channel icon representation */}
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    log.type === 'success' ? 'bg-primary-500/10 text-primary-500' :
                    log.type === 'error' ? 'bg-danger-500/10 text-danger-500' : 'bg-canvas-tertiary text-text-secondary'
                  }`}>
                    {log.channel === 'telegram' && (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )}
                    {log.channel === 'desktop' && (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    {log.channel === 'sound' && (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                        {log.channel} • {log.type}
                      </span>
                      <span className="text-[10px] text-text-muted font-medium">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-text-primary leading-relaxed font-semibold mt-1">
                      {log.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
