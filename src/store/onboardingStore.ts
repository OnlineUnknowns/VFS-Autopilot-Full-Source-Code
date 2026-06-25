import { create } from 'zustand';

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
}

export interface AccountDetails {
  id: string;
  email: string;
  password?: string;
  vac: string;
  category: string;
  applicants: Applicant[];
}

export interface NotificationSettings {
  desktop: boolean;
  sound: boolean;
  telegramEnabled: boolean;
  telegramToken: string;
  telegramChatId: string;
}

interface OnboardingState {
  currentStep: number;
  selectedCountries: string[];
  vfsAccounts: Record<string, AccountDetails[]>;
  notifications: NotificationSettings;

  // Actions
  setStep: (step: number) => void;
  toggleCountry: (countryId: string) => void;
  saveAccountsForCountry: (countryId: string, accounts: AccountDetails[]) => void;
  updateNotificationToggle: (key: keyof Omit<NotificationSettings, 'telegramToken' | 'telegramChatId'>, value: boolean) => void;
  updateTelegramCredentials: (token: string, chatId: string) => void;
  resetStore: () => void;
}

const initialNotificationSettings: NotificationSettings = {
  desktop: true,
  sound: true,
  telegramEnabled: false,
  telegramToken: '',
  telegramChatId: '',
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  selectedCountries: [],
  vfsAccounts: {},
  notifications: initialNotificationSettings,

  setStep: (step) => set({ currentStep: step }),
  
  toggleCountry: (countryId) =>
    set((state) => {
      const isSelected = state.selectedCountries.includes(countryId);
      const selected = isSelected
        ? state.selectedCountries.filter((id) => id !== countryId)
        : [...state.selectedCountries, countryId];
      
      // Clean up accounts mapping if a country is deselected
      const updatedAccounts = { ...state.vfsAccounts };
      if (isSelected && updatedAccounts[countryId]) {
        delete updatedAccounts[countryId];
      }

      return {
        selectedCountries: selected,
        vfsAccounts: updatedAccounts,
      };
    }),

  saveAccountsForCountry: (countryId, accounts) =>
    set((state) => ({
      vfsAccounts: {
        ...state.vfsAccounts,
        [countryId]: accounts,
      },
    })),

  updateNotificationToggle: (key, value) =>
    set((state) => ({
      notifications: {
        ...state.notifications,
        [key]: value,
      },
    })),

  updateTelegramCredentials: (token, chatId) =>
    set((state) => ({
      notifications: {
        ...state.notifications,
        telegramToken: token,
        telegramChatId: chatId,
      },
    })),

  resetStore: () =>
    set({
      currentStep: 1,
      selectedCountries: [],
      vfsAccounts: {},
      notifications: initialNotificationSettings,
    }),
}));
