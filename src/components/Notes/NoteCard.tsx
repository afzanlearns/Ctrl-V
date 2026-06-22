import { useState, useRef, useEffect, useCallback } from 'react';
import { Pin, Trash2, Copy, Palette, FileText } from 'lucide-react';
import type { Note } from '../../store/types';
import { NOTE_COLORS } from '../../store/types';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { useCollectionsStore } from '../../store/collectionsStore';
import { renderMarkdown, hasMarkdown } from '../../utils/markdown';
import { formatTimestamp, formatCharCount } from '../../utils/date';
import toast from 'react-hot-toast';

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const { updateNoteById, deleteNote, togglePin, tags, deletingId } = useNotesStore();
  const { setSearchQuery, setSelectedCollectionId, openModal } = useUIStore();
  const { collections, addNoteToCollection } = useCollectionsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDeleting = deletingId === note.id;

  const hasMd = hasMarkdown(note.content);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== note.content) {
      updateNoteById(note.id, { content: trimmed });
    } else {
      setEditContent(note.content);
    }
    setIsEditing(false);
  }, [editContent, note.id, note.content, updateNoteById]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditContent(note.content);
      setIsEditing(false);
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(note.content);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleClick = () => {
    if (!isEditing) {
      openModal('focus', note.id);
    }
  };

  const handleColorChange = async (colorId: string) => {
    await updateNoteById(note.id, { colorId } as Partial<Note>);
    setShowColorPicker(false);
  };

  const handleAddToCollection = async (collectionId: string) => {
    await addNoteToCollection(collectionId, note.id);
    const col = collections.find((c) => c.id === collectionId);
    toast.success(`Added to ${col?.name ?? 'collection'}`);
    setShowCollectionPicker(false);
  };

  const noteTags = note.tags
    .map((tagId) => tags.find((t) => t.id === tagId))
    .filter(Boolean) as typeof tags;

  const unusedCollections = collections.filter((c) => !c.noteIds.includes(note.id));

  return (
    <div
      className={`note-${note.colorId} sticky-note group relative mb-5 break-inside-avoid rounded-xl border p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${
        isDeleting ? 'animate-tear-out' : 'animate-note-appear'
      } ${note.isPinned ? 'ring-2 ring-sky-400/40' : ''}`}
      onClick={handleClick}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', note.id);
        e.dataTransfer.effectAllowed = 'move';
        useUIStore.getState().setDraggingNoteId(note.id);
      }}
      onDragEnd={() => useUIStore.getState().setDraggingNoteId(null)}
    >
      {/* Tag Badges */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {noteTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: `${tag.color}18`, color: tag.color }}
          >
            {tag.name}
          </span>
        ))}
        {note.isPinned && (
          <span className="inline-flex items-center text-[10px] text-sky-500">
            <Pin size={10} className="mr-0.5" fill="currentColor" />
            Pinned
          </span>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-gray-700 outline-none dark:text-gray-300"
          rows={Math.max(3, editContent.split('\n').length)}
        />
      ) : showMarkdown ? (
        <div
          className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300 prose-headings:font-semibold prose-a:text-sky-600 dark:prose-a:text-sky-400"
          onClick={(e) => e.stopPropagation()}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
        />
      ) : (
        <div
          className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 8,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {note.content}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
          <span>{formatTimestamp(note.createdAt)}</span>
          <span>·</span>
          <span>{formatCharCount(note.content.length)}</span>
        </div>

        <div className="flex items-center gap-0.5 md:opacity-0 md:transition-opacity md:duration-150 md:group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
          {/* Color picker */}
          <div className="relative">
            <button
              onClick={() => { setShowColorPicker(!showColorPicker); setShowCollectionPicker(false); }}
              className="touch-target-sm rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              title="Change color"
            >
              <Palette size={13} />
            </button>
            {showColorPicker && (
              <div className="absolute bottom-full right-0 z-30 mb-1 flex gap-1 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleColorChange(c.id)}
                    className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-125 ${
                      c.border
                    } ${note.colorId === c.id ? 'border-gray-800 dark:border-white scale-125' : 'border-transparent'}`}
                    style={{ backgroundColor: `var(--color-${c.id})` }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Markdown toggle */}
          {hasMd && (
            <button
              onClick={() => setShowMarkdown(!showMarkdown)}
              className={`touch-target-sm rounded-md p-1.5 transition-colors ${
                showMarkdown
                  ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400'
                  : 'text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              }`}
              title={showMarkdown ? 'Show raw' : 'Render markdown'}
            >
              <FileText size={13} />
            </button>
          )}

          {/* Add to collection */}
          {unusedCollections.length > 0 && (
            <div className="relative">
              <button
                onClick={() => { setShowCollectionPicker(!showCollectionPicker); setShowColorPicker(false); }}
                className="touch-target-sm rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                title="Add to collection"
              >
                <svg size={13} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </button>
              {showCollectionPicker && (
                <div className="absolute bottom-full right-0 z-30 mb-1 w-40 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
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
              )}
            </div>
          )}

          <button
            onClick={() => togglePin(note.id)}
            className={`touch-target-sm rounded-md p-1.5 transition-colors ${
              note.isPinned
                ? 'text-sky-500 hover:text-sky-600'
                : 'text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300'
            }`}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={13} fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleCopy}
            className="touch-target-sm rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            title="Copy"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => deleteNote(note.id)}
            className="touch-target-sm rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-950/50 dark:hover:text-red-400"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
