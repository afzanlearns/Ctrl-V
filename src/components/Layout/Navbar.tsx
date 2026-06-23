import { useState, useEffect, useRef } from 'react';
import { Search, Clipboard, Trash2, Settings, Menu, Sun, Moon, Download, PenLine, MoreVertical } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { useTheme } from '../../hooks/useTheme';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface NavbarProps {
  onPasteClick: () => void;
}

export function Navbar({ onPasteClick }: NavbarProps) {
  const { notes } = useNotesStore();
  const { searchQuery, setSearchQuery, showTrash, toggleTrash, setSidebarOpen, openModal, setActiveWritePad } = useUIStore();
  const { theme, toggleTheme } = useTheme();
  const { isInstallable, promptInstall } = usePWAInstall();

  const trashCount = notes.filter((n) => n.isDeleted).length;
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [moreOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && moreOpen) setMoreOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [moreOpen]);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90 safe-area-top">
      <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">

        {/* ===== Mobile (<768px) ===== */}
        <div className="flex items-center w-full md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 touch-target"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center justify-center flex-1 gap-2.5 px-1">
            <button
              onClick={onPasteClick}
              className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-sky-600 active:scale-[0.97]"
            >
              <Clipboard size={14} />
              <span>Paste</span>
            </button>
            <button
              onClick={() => { setActiveWritePad(true); setSidebarOpen(false); }}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <PenLine size={14} />
              <span>Write</span>
            </button>
          </div>

          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 touch-target"
              aria-label="More actions"
            >
              <MoreVertical size={20} />
              {trashCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {trashCount > 9 ? '9+' : trashCount}
                </span>
              )}
            </button>

            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-50 w-56 origin-top-right rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-800 dark:ring-white/10 animate-scale-in">
                  <div className="px-3 pb-1.5">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search notes…"
                        className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-7 pr-2.5 text-xs outline-none transition-colors placeholder:text-gray-400 focus:border-sky-400 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="mx-3 border-t border-gray-100 dark:border-gray-700" />

                  <MobileAction
                    icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    onClick={() => { toggleTheme(); setMoreOpen(false); }}
                  />
                  {isInstallable && (
                    <MobileAction
                      icon={<Download size={16} />}
                      label="Install app"
                      onClick={() => { promptInstall(); setMoreOpen(false); }}
                    />
                  )}
                  <MobileAction
                    icon={<Trash2 size={16} />}
                    label="Trash"
                    badge={trashCount}
                    active={showTrash}
                    onClick={() => { toggleTrash(); setMoreOpen(false); }}
                  />
                  <MobileAction
                    icon={<Settings size={16} />}
                    label="Settings"
                    onClick={() => { openModal('settings'); setMoreOpen(false); }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===== Desktop (>=768px) ===== */}
        <div className="hidden md:flex w-full items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg max-md:p-1.5 md:p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 lg:hidden touch-target"
              aria-label="Toggle sidebar"
            >
              <Menu size={16} />
            </button>
            <div className="flex items-center gap-2 select-none min-w-0">
              <span className="max-md:text-sm md:text-base font-bold tracking-tighter text-gray-800 dark:text-gray-100 shrink-0">
                ⌘V
              </span>
              <span className="text-[11px] font-medium tracking-wide text-gray-400 dark:text-gray-500 hidden sm:inline-block truncate">
                paste · capture · move on
              </span>
            </div>
          </div>

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
              onClick={() => openModal('mobilePaste')}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 lg:hidden"
              title="Paste a note"
            >
              <Clipboard size={13} />
              <span className="hidden sm:inline">Paste Note</span>
            </button>

            <button
              onClick={() => toggleTrash()}
              className={`relative rounded-lg max-md:p-1.5 md:p-2 transition-colors touch-target ${
                showTrash
                  ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/50'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              }`}
              aria-label="Trash"
            >
              <Trash2 size={14} />
              {trashCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {trashCount > 9 ? '9+' : trashCount}
                </span>
              )}
            </button>

            <button
              onClick={toggleTheme}
              className="rounded-lg max-md:p-1.5 md:p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 touch-target"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {isInstallable && (
              <button
                onClick={promptInstall}
                className="rounded-lg max-md:p-1.5 md:p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 touch-target"
                aria-label="Install app"
                title="Install app"
              >
                <Download size={14} />
              </button>
            )}

            <button
              onClick={() => openModal('settings')}
              className="rounded-lg max-md:p-1.5 md:p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 touch-target"
              aria-label="Settings"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileAction({
  icon, label, badge, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors ${
        active
          ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
      }`}
    >
      <span className="flex items-center gap-3">
        <span className="text-gray-500 dark:text-gray-400">{icon}</span>
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}
