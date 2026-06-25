import { create } from 'zustand';
import { AccountDetails, Applicant } from './onboardingStore';

interface AccountsState {
  vfsAccounts: Record<string, AccountDetails[]>;
  activeAccounts: Record<string, boolean>; // Maps accountId -> boolean (active/paused state)
  toggleAccountActive: (accountId: string) => void;
  addAccount: (countryId: string, account: Omit<AccountDetails, 'id'>) => void;
  editAccount: (countryId: string, accountId: string, updates: Partial<AccountDetails>) => void;
  deleteAccount: (countryId: string, accountId: string) => void;
  setAccounts: (accounts: Record<string, AccountDetails[]>) => void;
}

// Initial mock accounts for UI demonstration purposes only.
// All passwords are placeholder strings — never use real credentials in source code.
const initialAccounts: Record<string, AccountDetails[]> = {
  pakistan: [
    {
      id: 'acc_pk_1',
      email: 'demo_user@example.com',
      password: '********',
      vac: 'Islamabad VAC',
      category: 'tourist',
      applicants: [
        { id: 'ap_pk_1', firstName: 'John', lastName: 'Doe', passportNumber: 'XX0000001' }
      ]
    }
  ],
  india: [
    {
      id: 'acc_in_1',
      email: 'demo_user2@example.com',
      password: '********',
      vac: 'Delhi VAC',
      category: 'student',
      applicants: [
        { id: 'ap_in_1', firstName: 'Jane', lastName: 'Smith', passportNumber: 'XX0000002' }
      ]
    }
  ],
  morocco: [
    {
      id: 'acc_ma_1',
      email: 'demo_user3@example.com',
      password: '********',
      vac: 'Rabat VAC',
      category: 'business',
      applicants: [
        { id: 'ap_ma_1', firstName: 'Ali', lastName: 'Hassan', passportNumber: 'XX0000003' }
      ]
    }
  ],
  egypt: [
    {
      id: 'acc_eg_1',
      email: 'demo_user4@example.com',
      password: '********',
      vac: 'Cairo VAC',
      category: 'family',
      applicants: [
        { id: 'ap_eg_1', firstName: 'Sara', lastName: 'Ahmed', passportNumber: 'XX0000004' }
      ]
    }
  ]
};

// Seed initial active statuses
const initialActiveStatuses: Record<string, boolean> = {
  acc_pk_1: true,
  acc_in_1: true,
  acc_ma_1: false,
  acc_eg_1: false
};

export const useAccountsStore = create<AccountsState>((set) => ({
  vfsAccounts: initialAccounts,
  activeAccounts: initialActiveStatuses,

  toggleAccountActive: (accountId) =>
    set((state) => ({
      activeAccounts: {
        ...state.activeAccounts,
        [accountId]: !state.activeAccounts[accountId]
      }
    })),

  addAccount: (countryId, account) =>
    set((state) => {
      const newAccountId = `acc_${Math.random().toString(36).substr(2, 9)}`;
      const newAccountRecord: AccountDetails = {
        ...account,
        id: newAccountId
      };

      const countryList = state.vfsAccounts[countryId] || [];
      
      return {
        vfsAccounts: {
          ...state.vfsAccounts,
          [countryId]: [...countryList, newAccountRecord]
        },
        activeAccounts: {
          ...state.activeAccounts,
          [newAccountId]: true // default to active
        }
      };
    }),

  editAccount: (countryId, accountId, updates) =>
    set((state) => {
      const countryList = state.vfsAccounts[countryId] || [];
      const updatedList = countryList.map((acc) =>
        acc.id === accountId ? { ...acc, ...updates } : acc
      );

      return {
        vfsAccounts: {
          ...state.vfsAccounts,
          [countryId]: updatedList
        }
      };
    }),

  deleteAccount: (countryId, accountId) =>
    set((state) => {
      const countryList = state.vfsAccounts[countryId] || [];
      const updatedList = countryList.filter((acc) => acc.id !== accountId);

      const nextActiveMap = { ...state.activeAccounts };
      delete nextActiveMap[accountId];

      return {
        vfsAccounts: {
          ...state.vfsAccounts,
          [countryId]: updatedList
        },
        activeAccounts: nextActiveMap
      };
    }),

  setAccounts: (accounts) => set({ vfsAccounts: accounts })
}));
