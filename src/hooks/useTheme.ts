import { useEffect } from 'react';
import { useNotesStore } from '../store/notesStore';

export function useTheme() {
  const { settings, updateSettings } = useNotesStore();
  const theme = settings.theme;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' });
  };

  return { theme, toggleTheme };
}
