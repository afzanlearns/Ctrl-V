import { useState } from 'react';
import { X, Pin, Trash2, Copy, RotateCcw, Palette, FileText, FolderPlus } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { useCollectionsStore } from '../../store/collectionsStore';
import { NOTE_COLORS } from '../../store/types';
import { renderMarkdown, hasMarkdown } from '../../utils/markdown';
import { formatDateFull } from '../../utils/date';
import toast from 'react-hot-toast';

export function NoteFocusModal() {
  const { notes, tags, updateNoteById, deleteNote, restoreNote, permanentlyDeleteNote } = useNotesStore();
  const { activeModal, focusNoteId, openModal, closeModal } = useUIStore();
  const { collections, addNoteToCollection, removeNoteFromCollection } = useCollectionsStore();
  const [showMarkdown, setShowMarkdown] = useState(false);

  if (activeModal !== 'focus' || !focusNoteId) return null;

  const note = notes.find((n) => n.id === focusNoteId);

  if (!note) return null;

  const noteTags = note.tags
    .map((tagId) => tags.find((t) => t.id === tagId))
    .filter(Boolean) as typeof tags;

  const noteCollections = collections.filter((c) => c.noteIds.includes(note.id));
  const unusedCollections = collections.filter((c) => !c.noteIds.includes(note.id));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note.content);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDelete = () => {
    deleteNote(note.id);
    closeModal();
    toast.success('Note moved to trash');
  };

  const handleRestore = async () => {
    await restoreNote(note.id);
    closeModal();
    toast.success('Note restored');
  };

  const handlePermanentDelete = async () => {
    await permanentlyDeleteNote(note.id);
    closeModal();
    toast.success('Note permanently deleted');
  };

  const handleColorChange = async (colorId: string) => {
    await updateNoteById(note.id, { colorId } as Partial<typeof note>);
  };

  const handleAddToCollection = async (collectionId: string) => {
    await addNoteToCollection(collectionId, note.id);
    const col = collections.find((c) => c.id === collectionId);
    toast.success(`Added to ${col?.name ?? 'collection'}`);
  };

  const handleRemoveFromCollection = async (collectionId: string) => {
    await removeNoteFromCollection(collectionId, note.id);
    toast.success('Removed from collection');
  };

  const hasMd = hasMarkdown(note.content);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md animate-fade-in"
        onClick={closeModal}
      />
      <div className={`relative w-full max-w-2xl max-h-[85vh] animate-scale-in overflow-hidden rounded-2xl border shadow-[0_25px_50px_rgba(0,0,0,0.2)]`}>
        <div className={`note-${note.colorId} flex max-h-[85vh] flex-col border`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-3 dark:border-white/5">
            <div className="flex items-center gap-2">
              {noteTags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
                  style={{ backgroundColor: `${tag.color}18`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
              {note.isPinned && <Pin size={12} className="text-sky-500" fill="currentColor" />}
            </div>
            <div className="flex items-center gap-1">
              {/* Color picker */}
              <div className="relative group/color">
                <button
                  onClick={() => { }}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-black/10 hover:text-gray-600 dark:hover:bg-white/10"
                  title="Change color"
                >
                  <Palette size={15} />
                </button>
                <div className="absolute right-0 top-full z-30 mt-1 hidden group-hover/color:flex gap-1 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleColorChange(c.id)}
                      className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-125 ${
                        note.colorId === c.id ? 'border-gray-800 dark:border-white scale-125' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: `var(--color-${c.id})` }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Markdown toggle */}
              {hasMd && (
                <button
                  onClick={() => setShowMarkdown(!showMarkdown)}
                  className={`rounded-lg p-1.5 transition-colors ${
                    showMarkdown
                      ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400'
                      : 'text-gray-400 hover:bg-black/10 hover:text-gray-600 dark:hover:bg-white/10'
                  }`}
                  title={showMarkdown ? 'Show raw' : 'Render markdown'}
                >
                  <FileText size={15} />
                </button>
              )}

              {/* Collections */}
              {unusedCollections.length > 0 && (
                <div className="relative group/col">
                  <button
                    onClick={() => { }}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-black/10 hover:text-gray-600 dark:hover:bg-white/10"
                    title="Add to collection"
                  >
                    <FolderPlus size={15} />
                  </button>
                  <div className="absolute right-0 top-full z-30 mt-1 hidden group-hover/col:block w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {unusedCollections.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleAddToCollection(c.id)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handleCopy} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-black/10 hover:text-gray-600 dark:hover:bg-white/10" title="Copy">
                <Copy size={15} />
              </button>
              {note.isDeleted ? (
                <>
                  <button onClick={handleRestore} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-emerald-100 hover:text-emerald-500 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400" title="Restore">
                    <RotateCcw size={15} />
                  </button>
                  <button onClick={handlePermanentDelete} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-400" title="Delete forever">
                    <Trash2 size={15} />
                  </button>
                </>
              ) : (
                <button onClick={handleDelete} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-400" title="Delete">
                  <Trash2 size={15} />
                </button>
              )}
              <button onClick={closeModal} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-black/10 hover:text-gray-600 dark:hover:bg-white/10" title="Close">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-5 py-4">
            {showMarkdown ? (
              <div
                className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 prose-headings:font-semibold prose-a:text-sky-600 dark:prose-a:text-sky-400"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {note.content}
              </p>
            )}
          </div>

          {/* Collections bar */}
          {noteCollections.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-black/5 px-5 py-2 dark:border-white/5">
              <span className="text-[10px] text-gray-400 dark:text-gray-500">Collections:</span>
              {noteCollections.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px]"
                  style={{ backgroundColor: `${c.color}18`, color: c.color }}
                >
                  {c.name}
                  <button
                    onClick={() => handleRemoveFromCollection(c.id)}
                    className="hover:text-red-400"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-black/5 px-5 py-3 text-[11px] text-gray-400 dark:border-white/5">
            <span>{formatDateFull(note.createdAt)}</span>
            <span>{note.content.length} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
