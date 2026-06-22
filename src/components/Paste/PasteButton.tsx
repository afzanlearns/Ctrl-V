import { useState, useRef, useCallback } from 'react';
import { Upload, Clipboard } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { readClipboard, isClipboardSupported } from '../../services/clipboardManager';
import toast from 'react-hot-toast';

interface PasteButtonProps {
  className?: string;
}

export function PasteButton({ className = '' }: PasteButtonProps) {
  const { addNoteFromPaste } = useNotesStore();
  const { openModal } = useUIStore();
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePaste = useCallback(async () => {
    if (isClipboardSupported()) {
      const text = await readClipboard();
      if (text) {
        addNoteFromPaste(text);
        toast.success('Note created from clipboard');
        return;
      }
    }
    openModal('paste');
  }, [addNoteFromPaste, openModal]);

  return (
    <button
      ref={buttonRef}
      onClick={handlePaste}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 transition-all hover:border-sky-400 hover:bg-sky-50/50 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-sky-500 dark:hover:bg-sky-950/30 ${className}`}
    >
      <div className="mb-4 rounded-2xl bg-sky-100 p-4 transition-transform duration-200 group-hover:scale-110 dark:bg-sky-900/50">
        {isHovered ? (
          <Clipboard size={28} className="text-sky-600 dark:text-sky-400" />
        ) : (
          <Upload size={28} className="text-sky-500 dark:text-sky-400" />
        )}
      </div>
      <p className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Paste to capture
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Click or press{' '}
        <kbd className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          ⌘⇧V
        </kbd>
      </p>
    </button>
  );
}
