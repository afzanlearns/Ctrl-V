import { Search, Clipboard, Trash2, Settings, Menu, Sun, Moon, Download, PenLine } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { useTheme } from '../../hooks/useTheme';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface NavbarProps {
  onPasteClick: () => void;
}

export function Navbar({ onPasteClick }: NavbarProps) {
  const { notes } = useNotesStore();
  const { searchQuery, setSearchQuery, showTrash, toggleTrash, setSidebarOpen, openModal } = useUIStore();
  const { theme, toggleTheme } = useTheme();
  const { isInstallable, promptInstall } = usePWAInstall();

  const trashCount = notes.filter((n) => n.isDeleted).length;

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90 safe-area-top">
      <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 lg:hidden touch-target"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 select-none min-w-0">
            <span className="text-lg font-bold tracking-tighter text-gray-800 dark:text-gray-100 shrink-0">
              ⌘V
            </span>
            <span className="text-[11px] font-medium tracking-wide text-gray-400 dark:text-gray-500 hidden sm:inline-block truncate">
              paste · capture · move on
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden max-w-sm flex-1 px-4 md:block">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              data-search-input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder:text-gray-500 dark:focus:border-sky-500 dark:focus:bg-gray-800"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={onPasteClick}
            className="flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-sky-600 hover:shadow-md active:scale-[0.97]"
          >
            <Clipboard size={13} />
            <span className="hidden sm:inline">Paste</span>
            <kbd className="hidden rounded bg-sky-600/40 px-1 py-0.5 text-[9px] font-mono md:inline">
              ⌘⇧V
            </kbd>
          </button>

          <button
            onClick={onPasteClick}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Write a note"
          >
            <PenLine size={13} />
            <span className="hidden sm:inline">Write</span>
          </button>

          <button
            onClick={() => toggleTrash()}
            className={`relative rounded-lg p-2 transition-colors ${
              showTrash
                ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/50'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            }`}
            aria-label="Trash"
          >
            <Trash2 size={17} />
            {trashCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {trashCount > 9 ? '9+' : trashCount}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {isInstallable && (
            <button
              onClick={promptInstall}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Install app"
              title="Install app"
            >
              <Download size={17} />
            </button>
          )}

          <button
            onClick={() => openModal('settings')}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Settings"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
