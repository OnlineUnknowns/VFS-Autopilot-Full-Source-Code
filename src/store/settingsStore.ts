import { create } from 'zustand';

export interface ProxyTestResult {
  proxy: string;
  status: 'idle' | 'testing' | 'success' | 'failed';
  speed?: number; // ms response time
}

interface SettingsState {
  pollingInterval: number; // in seconds
  proxiesEnabled: boolean;
  proxies: string; // newline separated IP:PORT
  proxyTestResults: ProxyTestResult[];
  captchaKey: string;
  captchaBalance: number;
  isTestingProxies: boolean;

  updateSettings: (updates: Partial<Pick<SettingsState, 'pollingInterval' | 'proxiesEnabled' | 'proxies' | 'captchaKey'>>) => void;
  testProxies: () => Promise<void>;
  deductCaptchaBalance: (amount: number) => void;
}

// Example proxy format: IP:PORT or IP:PORT:USER:PASS (one per line)
const initialProxies = ``;

export const useSettingsStore = create<SettingsState>((set, get) => ({
  pollingInterval: 60, // default to 60s
  proxiesEnabled: false,
  proxies: initialProxies,
  proxyTestResults: [],
  captchaKey: '',
  captchaBalance: 0,
  isTestingProxies: false,

  updateSettings: (updates) => set((state) => ({ ...state, ...updates })),

  testProxies: async () => {
    const { proxies } = get();
    if (!proxies.trim()) return;

    set({ isTestingProxies: true });

    // Parse proxies by newline
    const proxyList = proxies
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    // Set initial testing status for parsed items
    const initialResults: ProxyTestResult[] = proxyList.map((p) => ({
      proxy: p,
      status: 'testing'
    }));
    set({ proxyTestResults: initialResults });

    // Simulate testing each proxy sequentially with async pauses
    for (let i = 0; i < proxyList.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const isSuccess = Math.random() > 0.3; // 70% success rate mock
      const speed = isSuccess ? Math.floor(Math.random() * 400) + 100 : undefined;

      set((state) => {
        const nextResults = [...state.proxyTestResults];
        nextResults[i] = {
          proxy: proxyList[i],
          status: isSuccess ? 'success' : 'failed',
          speed
        };
        return { proxyTestResults: nextResults };
      });
    }

    set({ isTestingProxies: false });
  },

  deductCaptchaBalance: (amount) =>
    set((state) => ({
      captchaBalance: Math.max(0, state.captchaBalance - amount)
    }))
}));
