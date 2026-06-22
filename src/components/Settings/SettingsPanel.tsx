import { useState, useRef } from 'react';
import { X, Upload, Download, Trash2, Moon, Sun, Keyboard } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { useTheme } from '../../hooks/useTheme';
import { parseImportFile, downloadFile } from '../../services/shareLinkService';
import toast from 'react-hot-toast';

export function SettingsPanel() {
  const { exportData, importData, clearAll, notes, tags } = useNotesStore();
  const { activeModal, closeModal } = useUIStore();
  const { theme, toggleTheme } = useTheme();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (activeModal !== 'settings') return null;

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const data = parseImportFile(text);
    if (!data) {
      toast.error('Invalid file format');
      return;
    }

    try {
      const result = await importData(data);
      toast.success(`Imported ${result.notesImported} notes, ${result.tagsImported} tags`);
    } catch {
      toast.error('Import failed');
    }
    e.target.value = '';
  };

  const handleExport = async () => {
    const json = await exportData();
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(json, `ctrlv-backup-${timestamp}.json`, 'application/json');
    toast.success('Backup downloaded');
  };

  const handleClearAll = async () => {
    await clearAll();
    setShowClearConfirm(false);
    toast.success('All data cleared');
  };

  const shortcuts = [
    { keys: '⌘⇧V', desc: 'Open paste modal' },
    { keys: '⌘K', desc: 'Focus search' },
    { keys: '⌘,', desc: 'Open settings' },
    { keys: '⌘Enter', desc: 'Save note' },
    { keys: 'Esc', desc: 'Close modals' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={closeModal}
      />
      <div className="relative w-full max-w-lg max-h-[85vh] animate-scale-in overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            onClick={closeModal}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <SettingsSection title="Appearance">
            <SettingsToggle
              icon={theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              label={theme === 'dark' ? 'Dark mode' : 'Light mode'}
              enabled={theme === 'dark'}
              onToggle={toggleTheme}
            />
          </SettingsSection>

          {/* Data */}
          <SettingsSection title="Data">
            <div className="space-y-2">
              <SettingsAction
                icon={<Download size={16} className="text-emerald-500" />}
                iconBg="bg-emerald-100 dark:bg-emerald-900/50"
                title="Export backup"
                desc={`${notes.length} notes, ${tags.length} tags`}
                onClick={handleExport}
              />
              <SettingsAction
                icon={<Upload size={16} className="text-sky-500" />}
                iconBg="bg-sky-100 dark:bg-sky-900/50"
                title="Import from backup"
                desc="JSON file"
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />

              {!showClearConfirm ? (
                <SettingsAction
                  icon={<Trash2 size={16} className="text-red-500" />}
                  iconBg="bg-red-100 dark:bg-red-900/50"
                  title="Clear all data"
                  desc="This cannot be undone"
                  onClick={() => setShowClearConfirm(true)}
                  danger
                />
              ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30">
                  <p className="mb-2 text-sm text-red-700 dark:text-red-300">
                    Delete everything? This is permanent.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500"
                    >
                      Delete everything
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SettingsSection>

          {/* Trash */}
          <SettingsSection title="Trash">
            <div className="space-y-2">
              <SettingsAction
                icon={<Trash2 size={16} className="text-orange-500" />}
                iconBg="bg-orange-100 dark:bg-orange-900/50"
                title="Empty trash"
                desc="Permanently delete all trashed notes"
                onClick={async () => {
                  const { emptyTrash } = useNotesStore.getState();
                  await emptyTrash();
                  toast.success('Trash emptied');
                }}
                danger
              />
            </div>
          </SettingsSection>

          {/* Shortcuts */}
          <SettingsSection title="Keyboard Shortcuts" icon={<Keyboard size={12} />}>
            <div className="space-y-1">
              {shortcuts.map((s) => (
                <div
                  key={s.keys}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-400">{s.desc}</span>
                  <kbd className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </SettingsSection>

          <div className="border-t border-gray-100 pt-4 text-center dark:border-gray-800">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              ⌘V — All data stays in your browser. Nothing leaves your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function SettingsToggle({ icon, label, enabled, onToggle }: { icon: React.ReactNode; label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800"
    >
      <span className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
        {icon}
        {label}
      </span>
      <div className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </div>
    </button>
  );
}

function SettingsAction({ icon, iconBg, title, desc, onClick, danger = false }: { icon: React.ReactNode; iconBg: string; title: string; desc: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-sm ${
        danger
          ? 'border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-950/30'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
      }`}
    >
      <div className={`rounded-lg ${iconBg} p-2`}>{icon}</div>
      <div>
        <p className={`text-sm font-medium ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
          {title}
        </p>
        <p className={`text-[11px] ${danger ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>{desc}</p>
      </div>
    </button>
  );
}
