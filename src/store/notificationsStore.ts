import { create } from 'zustand';

export interface NotificationLog {
  id: string;
  type: 'success' | 'error' | 'info';
  channel: 'desktop' | 'telegram' | 'sound';
  message: string;
  timestamp: string; // ISO date string or relative text
  read: boolean;
}

interface NotificationsState {
  logs: NotificationLog[];
  addLog: (log: Omit<NotificationLog, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

// Initial high-fidelity notification logs for demo and display
const initialLogs: NotificationLog[] = [
  {
    id: 'log_1',
    type: 'success',
    channel: 'telegram',
    message: 'Slot found for Pakistan - Islamabad VAC (Tourist Visa). Telegram message successfully dispatched.',
    timestamp: '2 mins ago',
    read: false
  },
  {
    id: 'log_2',
    type: 'success',
    channel: 'desktop',
    message: 'VFS slot found for India - Delhi VAC (Student Visa). System tray popup shown.',
    timestamp: '5 mins ago',
    read: false
  },
  {
    id: 'log_3',
    type: 'error',
    channel: 'desktop',
    message: 'Search failed for Egypt - Cairo VAC. Error: Connection failed. Retrying in 120 seconds.',
    timestamp: '10 mins ago',
    read: true
  },
  {
    id: 'log_4',
    type: 'info',
    channel: 'sound',
    message: 'Automation scanning queue successfully started for Morocco - Rabat VAC.',
    timestamp: '15 mins ago',
    read: true
  }
];

export const useNotificationsStore = create<NotificationsState>((set) => ({
  logs: initialLogs,

  addLog: (log) =>
    set((state) => {
      const newLog: NotificationLog = {
        ...log,
        id: `log_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: 'Just now',
        read: false
      };
      return { logs: [newLog, ...state.logs] };
    }),

  markAllRead: () =>
    set((state) => ({
      logs: state.logs.map((log) => ({ ...log, read: true }))
    })),

  clearAll: () =>
    set({ logs: [] })
}));
