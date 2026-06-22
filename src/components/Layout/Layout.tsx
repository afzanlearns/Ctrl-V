import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useTheme } from '../../hooks/useTheme';

interface LayoutProps {
  onPasteClick: () => void;
}

export function Layout({ onPasteClick }: LayoutProps) {
  useKeyboard();
  useTheme();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: '10px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          className: 'dark:bg-gray-800 dark:text-gray-200',
        }}
      />
      <Navbar onPasteClick={onPasteClick} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 safe-area-bottom">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
