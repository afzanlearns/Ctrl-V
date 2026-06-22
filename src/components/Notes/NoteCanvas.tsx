import { useRef } from 'react';
import { Search, ClipboardList } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { useCollectionsStore } from '../../store/collectionsStore';
import { sortNotes, filterNotes } from '../../services/autoDetect';
import { NoteCard } from './NoteCard';

export function NoteCanvas() {
  const { notes, updateNoteById } = useNotesStore();
  const { searchQuery, setSearchQuery, selectedTagId, selectedCollectionId, sortMode, showTrash, setDraggingNoteId, openModal } = useUIStore();
  const { collections, addNoteToCollection } = useCollectionsStore();
  const lastTapRef = useRef(0);

  let filtered = filterNotes(notes, searchQuery, selectedTagId, showTrash);

  // Filter by collection
  if (selectedCollectionId) {
    const col = collections.find((c) => c.id === selectedCollectionId);
    if (col) {
      filtered = filtered.filter((n) => col.noteIds.includes(n.id));
    }
  }

  const sorted = sortNotes(filtered, sortMode);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;

    // If we're dropping into a collection drop zone
    const dropZone = (e.target as HTMLElement).closest('[data-collection-drop]');
    if (dropZone) {
      const collectionId = dropZone.getAttribute('data-collection-drop');
      if (collectionId) {
        await addNoteToCollection(collectionId, draggedId);
        setDraggingNoteId(null);
        return;
      }
    }

    // Reorder: find where to insert
    const targetCard = (e.target as HTMLElement).closest('[draggable]');
    if (targetCard) {
      const targetId = targetCard.getAttribute('data-note-id');
      if (targetId && targetId !== draggedId) {
        const ids = sorted.map((n) => n.id);
        const fromIdx = ids.indexOf(draggedId);
        const toIdx = ids.indexOf(targetId);
        if (fromIdx !== -1 && toIdx !== -1) {
          ids.splice(fromIdx, 1);
          ids.splice(toIdx, 0, draggedId);
          const { reorderNotes } = useNotesStore.getState();
          await reorderNotes(ids);
        }
      }
    }

    setDraggingNoteId(null);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[draggable]') || target.closest('button') || target.closest('textarea') || target.closest('input')) return;
    openModal('paste');
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const dt = now - lastTapRef.current;
    if (dt < 300 && dt > 0) {
      const target = e.target as HTMLElement;
      if (!target.closest('[draggable]') && !target.closest('button') && !target.closest('textarea') && !target.closest('input')) {
        openModal('paste');
      }
    }
    lastTapRef.current = now;
  };

  return (
    <div className="mx-auto max-w-6xl" onDragOver={handleDragOver} onDrop={handleDrop} onDoubleClick={handleDoubleClick} onTouchEnd={handleTouchEnd}>
      {/* Mobile search */}
      <div className="mb-4 md:hidden">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            data-search-input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes…"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:placeholder:text-gray-500 dark:focus:border-sky-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 rounded-2xl bg-gray-100 p-5 dark:bg-gray-800">
            <ClipboardList size={32} className="text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="mb-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400">
            {showTrash ? 'Trash is empty' : searchQuery ? 'No matching notes' : selectedCollectionId ? 'No notes in this collection' : 'No notes yet'}
          </h3>
          <p className="max-w-xs text-sm text-gray-400 dark:text-gray-500">
            {showTrash
              ? 'Deleted notes appear here for 30 days'
              : searchQuery
                ? 'Try a different search term'
                : selectedCollectionId
                  ? 'Add notes to this collection from the note card'
                  : 'Press ⌘⇧V to paste your first note'}
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
          {sorted.map((note) => (
            <div key={note.id} className="stagger-item mb-5" data-note-id={note.id}>
              <NoteCard note={note} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
