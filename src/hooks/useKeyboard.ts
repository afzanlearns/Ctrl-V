import { useEffect, useCallback } from 'react';
import { useUIStore } from '../store/uiStore';

export function useKeyboard() {
  const { openModal, closeModal, setSearchQuery } = useUIStore();

  const handler = useCallback(
    (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + Shift + V → open paste modal
      if (isMeta && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        openModal('paste');
        return;
      }

      // Cmd/Ctrl + K → focus search
      if (isMeta && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        searchInput?.focus();
        return;
      }

      // Escape → close modals
      if (e.key === 'Escape') {
        closeModal();
        return;
      }

      // Cmd/Ctrl + , → settings
      if (isMeta && e.key === ',') {
        e.preventDefault();
        openModal('settings');
        return;
      }
    },
    [openModal, closeModal]
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
