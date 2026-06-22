import { useState, useRef, useCallback } from 'react';
import { Trash2, Eraser, Save, Palette } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { NOTE_COLORS } from '../../store/types';
import { formatCharCount } from '../../utils/date';
import toast from 'react-hot-toast';

export function WritePad() {
  const { addNote, tags } = useNotesStore();
  const { setActiveWritePad } = useUIStore();
  const [content, setContent] = useState('');
  const [colorId, setColorId] = useState('cream');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [key, setKey] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleErase = useCallback(() => {
    setContent('');
    textareaRef.current?.focus();
  }, []);

  const handleDelete = useCallback(() => {
    if (!content.trim()) return;
    setIsDeleting(true);
    setTimeout(() => {
      setContent('');
      setKey((k) => k + 1);
      setIsDeleting(false);
      textareaRef.current?.focus();
    }, 400);
  }, [content]);

  const handleSave = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    await addNote(trimmed, []);
    setContent('');
    setKey((k) => k + 1);
    toast.success('Note saved');
    textareaRef.current?.focus();
  }, [content, addNote]);

  return (
    <div className="mx-auto flex max-w-2xl items-start justify-center py-8 sm:py-12">
      <div
        key={key}
        className={`note-${colorId} w-full rounded-xl border p-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
          isDeleting ? 'animate-write-tear' : 'animate-note-appear'
        }`}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Write down
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Color picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-black/10 hover:text-gray-600 dark:hover:bg-white/10"
                title="Change color"
              >
                <Palette size={15} />
              </button>
              {showColorPicker && (
                <div className="absolute right-0 top-full z-30 mt-1 flex gap-1 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setColorId(c.id); setShowColorPicker(false); }}
                      className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-125 ${
                        colorId === c.id ? 'border-gray-800 dark:border-white scale-125' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: `var(--color-${c.id})` }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleErase}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-black/10 hover:text-gray-600 dark:hover:bg-white/10"
              title="Erase"
            >
              <Eraser size={15} />
            </button>
            <button
              onClick={handleDelete}
              disabled={!content.trim()}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-red-950/50 dark:hover:text-red-400"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write down anything that comes to mind…"
          className="w-full min-h-[240px] resize-none bg-transparent text-sm leading-relaxed text-gray-700 outline-none placeholder:text-gray-400/60 dark:text-gray-300 dark:placeholder:text-gray-500/60"
          autoFocus
        />

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/5">
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {content.length > 0 ? formatCharCount(content.length) : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveWritePad(false)}
              className="rounded-lg px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-sky-600 hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={13} />
              Save note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
