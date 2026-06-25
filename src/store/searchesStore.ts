import { create } from 'zustand';

export interface SearchItem {
  id: string;
  email: string;
  countryId: string;
  countryCode: string;
  vac: string;
  category: string;
  status: 'Searching' | 'Found' | 'Paused' | 'Failed';
  lastChecked: string;
  slotsFound: number;
}

interface SearchesState {
  searches: SearchItem[];
  toggleSearch: (id: string) => void;
  pauseAll: () => void;
  resumeAll: () => void;
  removeSearch: (id: string) => void;
  addSearch: (search: Omit<SearchItem, 'id' | 'status' | 'lastChecked' | 'slotsFound'>) => void;
  updateSearchStatus: (id: string, updates: Partial<Pick<SearchItem, 'status' | 'lastChecked' | 'slotsFound'>>) => void;
  setSearches: (searches: SearchItem[]) => void;
}

// Pre-seeded high-fidelity mock searches for visualization
const initialSearches: SearchItem[] = [
  {
    id: 'search_1',
    email: 'm***@gmail.com',
    countryId: 'pakistan',
    countryCode: 'PK',
    vac: 'Islamabad VAC',
    category: 'tourist',
    status: 'Searching',
    lastChecked: '2 mins ago',
    slotsFound: 0
  },
  {
    id: 'search_2',
    email: 'k***@yahoo.com',
    countryId: 'india',
    countryCode: 'IN',
    vac: 'Delhi VAC',
    category: 'student',
    status: 'Found',
    lastChecked: '5 mins ago',
    slotsFound: 4
  },
  {
    id: 'search_3',
    email: 'a***@outlook.com',
    countryId: 'morocco',
    countryCode: 'MA',
    vac: 'Rabat VAC',
    category: 'business',
    status: 'Paused',
    lastChecked: '1 hour ago',
    slotsFound: 0
  },
  {
    id: 'search_4',
    email: 'h***@gmail.com',
    countryId: 'egypt',
    countryCode: 'EG',
    vac: 'Cairo VAC',
    category: 'family',
    status: 'Failed',
    lastChecked: '10 mins ago',
    slotsFound: 0
  }
];

export const useSearchesStore = create<SearchesState>((set) => ({
  searches: initialSearches,

  toggleSearch: (id) =>
    set((state) => ({
      searches: state.searches.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'Paused' ? 'Searching' : 'Paused';
          return { ...s, status: nextStatus, lastChecked: 'Just now' };
        }
        return s;
      })
    })),

  pauseAll: () =>
    set((state) => ({
      searches: state.searches.map((s) =>
        s.status === 'Searching' ? { ...s, status: 'Paused', lastChecked: 'Just now' } : s
      )
    })),

  resumeAll: () =>
    set((state) => ({
      searches: state.searches.map((s) =>
        s.status === 'Paused' ? { ...s, status: 'Searching', lastChecked: 'Just now' } : s
      )
    })),

  removeSearch: (id) =>
    set((state) => ({
      searches: state.searches.filter((s) => s.id !== id)
    })),

  addSearch: (search) =>
    set((state) => {
      const newSearch: SearchItem = {
        ...search,
        id: `search_${Math.random().toString(36).substr(2, 9)}`,
        status: 'Searching',
        lastChecked: 'Just now',
        slotsFound: 0
      };
      return { searches: [newSearch, ...state.searches] };
    }),

  updateSearchStatus: (id, updates) =>
    set((state) => ({
      searches: state.searches.map((s) => (s.id === id ? { ...s, ...updates } : s))
    })),

  setSearches: (searches) => set({ searches })
}));
