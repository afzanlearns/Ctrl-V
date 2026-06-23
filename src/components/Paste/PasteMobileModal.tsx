import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import toast from 'react-hot-toast';

export function PasteMobileModal() {
  const { addNoteFromPaste } = useNotesStore();
  const { activeModal, closeModal } = useUIStore();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeModal === 'mobilePaste') {
      setContent('');
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [activeModal]);

  const handleSave = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    await addNoteFromPaste(trimmed);
    toast.success('Note created');
    closeModal();
    setContent('');
  };

  if (activeModal !== 'mobilePaste') return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={closeModal}
      />
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-xl bg-white p-6 dark:bg-gray-900 shadow-xl animate-slide-from-bottom safe-area-bottom">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Paste Note
          </h2>
          <button
            onClick={closeModal}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 touch-target"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={(e) => {
            const text = e.clipboardData?.getData('text/plain');
            if (text) {
              e.preventDefault();
              setContent((prev) => prev + text);
            }
          }}
          placeholder="Paste your note here..."
          className="mb-4 h-44 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-sky-500 dark:focus:bg-gray-800"
          rows={6}
        />

        <div className="flex gap-3">
          <button
            onClick={() => { closeModal(); setContent(''); }}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="flex-1 rounded-lg bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
