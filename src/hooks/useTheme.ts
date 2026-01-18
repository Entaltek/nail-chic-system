import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeType = 'girly' | 'corporate';

interface ThemeStore {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'girly',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'girly' ? 'corporate' : 'girly';
        set({ theme: newTheme });
        applyTheme(newTheme);
      },
    }),
    {
      name: 'entaltek-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        }
      },
    }
  )
);

function applyTheme(theme: ThemeType) {
  const root = document.documentElement;
  if (theme === 'corporate') {
    root.classList.add('theme-corporate');
  } else {
    root.classList.remove('theme-corporate');
  }
}
