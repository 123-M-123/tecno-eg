import { create } from 'zustand';

interface ConfigState {
  config: Record<string, any>;
  setConfig: (newConfig: Record<string, any>) => void;
}

// ESCUDO 1: VALORES DE FÁBRICA (Fallback)
export const DEFAULT_CONFIG = {
  primaryColor: '#630d16', // Vino Tecno-EG
  secondaryColor: '#f37021', // Naranja Tecno-EG
  headerBg: '#1e1e1e', // Gris Oscuro
  borderRadius: '12px',
  logoWidth: '210',
  fontFamily: 'Inter, sans-serif',
};

export const useConfigStore = create<ConfigState>((set) => ({
  config: DEFAULT_CONFIG,
  setConfig: (newConfig) => set((state) => ({
    config: { ...state.config, ...newConfig }
  })),
}));