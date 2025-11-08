import { create } from 'zustand';

interface AppState {
  isAuthenticated: boolean;
  isLocked: boolean;
  stealthMode: boolean;
  currentView: string;
  profile: any;
  moduleSettings: any;
  
  setAuthenticated: (value: boolean) => void;
  setLocked: (value: boolean) => void;
  toggleStealthMode: () => void;
  setCurrentView: (view: string) => void;
  setProfile: (profile: any) => void;
  setModuleSettings: (settings: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  isLocked: false,
  stealthMode: false,
  currentView: 'dashboard',
  profile: null,
  moduleSettings: {},
  
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setLocked: (value) => set({ isLocked: value }),
  toggleStealthMode: () => set((state) => ({ stealthMode: !state.stealthMode })),
  setCurrentView: (view) => set({ currentView: view }),
  setProfile: (profile) => set({ profile }),
  setModuleSettings: (settings) => set({ moduleSettings: settings }),
}));


