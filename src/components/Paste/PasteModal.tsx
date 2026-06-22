import { useState, useRef, useEffect } from 'react';
import { X, Clipboard, Send, Check, Palette } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { useCollectionsStore } from '../../store/collectionsStore';
import { NOTE_COLORS } from '../../store/types';
import toast from 'react-hot-toast';

export function PasteModal() {
  const { addNote, tags } = useNotesStore();
  const { activeModal, closeModal } = useUIStore();
  const { collections, addNoteToCollection } = useCollectionsStore();
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeModal === 'paste') {
      const timer = setTimeout(() => textareaRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [activeModal]);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const colorId = selectedColor ?? undefined;
    const colIds = selectedCollections.length > 0 ? selectedCollections : undefined;
    const note = await addNote(trimmed, selectedTags, colorId, colIds);
    for (const colId of selectedCollections) {
      await addNoteToCollection(colId, note.id);
    }
    toast.success('Note created');
    closeModal();
    setContent('');
    setSelectedTags([]);
    setSelectedColor(null);
    setSelectedCollections([]);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const toggleCollection = (colId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const handlePasteEvent = (e: React.ClipboardEvent) => {
    const text = e.clipboardData?.getData('text/plain');
    if (text) {
      e.preventDefault();
      setContent((prev) => prev + text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  if (activeModal !== 'paste') return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={closeModal}
      />
      <div className="relative w-full max-w-lg animate-scale-in rounded-xl border border-gray-200 bg-white p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-sky-100 p-1.5 dark:bg-sky-900/50">
              <Clipboard size={16} className="text-sky-600 dark:text-sky-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Paste or write a note
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={handlePasteEvent}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste your content here…"
          className="mb-4 h-36 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-sky-500 dark:focus:bg-gray-800"
          rows={5}
        />

        {/* Color picker */}
        <div className="mb-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <Palette size={12} />
            Color
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setSelectedColor(null)}
              className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                selectedColor === null ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'
              }`}
              style={{ background: 'linear-gradient(135deg, var(--color-butter) 0%, var(--color-mint) 50%, var(--color-blush) 100%)' }}
              title="Auto"
            />
            {NOTE_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedColor(c.id)}
                className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                  selectedColor === c.id ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: `var(--color-${c.id})` }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Tag selector */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            Assign tags (optional)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const isActive = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? 'border-transparent ring-2 ring-offset-1'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                          borderColor: tag.color,
                        }
                      : {}
                  }
                >
                  {isActive && <Check size={11} />}
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collection selector */}
        {collections.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Add to collection (optional)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {collections.map((col) => {
                const isActive = selectedCollections.includes(col.id);
                return (
                  <button
                    key={col.id}
                    onClick={() => toggleCollection(col.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? 'border-transparent ring-2 ring-offset-1'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: `${col.color}20`,
                            color: col.color,
                            borderColor: col.color,
                          }
                        : {}
                    }
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: col.color }} />
                    {col.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {content.length > 0 && `${content.length} characters`}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                closeModal();
                setContent('');
                setSelectedTags([]);
                setSelectedColor(null);
                setSelectedCollections([]);
              }}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-600 hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={14} />
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
