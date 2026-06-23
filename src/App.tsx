import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { ImportPage } from './pages/ImportPage';
import { PasteModal } from './components/Paste/PasteModal';
import { PasteMobileModal } from './components/Paste/PasteMobileModal';
import { ShareModal } from './components/Share/ShareModal';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { NoteFocusModal } from './components/Notes/NoteFocusModal';
import { useNotesStore } from './store/notesStore';
import { useUIStore } from './store/uiStore';
import { useCollectionsStore } from './store/collectionsStore';

export default function App() {
  const { init, isInitialized } = useNotesStore();
  const { loadCollections } = useCollectionsStore();
  const { openModal } = useUIStore();

  useEffect(() => {
    init();
    loadCollections();
  }, [init, loadCollections]);

  // Global paste handler — open modal for tag selection instead of auto-saving
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      const text = e.clipboardData?.getData('text/plain');
      if (text?.trim()) {
        e.preventDefault();
        openModal('paste');
      }
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [openModal]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <span className="text-2xl font-bold tracking-tighter text-gray-800 dark:text-gray-100">
            ⌘V
          </span>
          <div className="h-1 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-full w-full animate-pulse rounded-full bg-sky-400" />
          </div>
        </div>
      </div>
    );
  }

  const handlePasteClick = () => openModal('paste');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/import" element={<ImportPage />} />
        <Route element={<Layout onPasteClick={handlePasteClick} />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
      <PasteModal />
      <PasteMobileModal />
      <ShareModal />
      <SettingsPanel />
      <NoteFocusModal />
    </BrowserRouter>
  );
}
