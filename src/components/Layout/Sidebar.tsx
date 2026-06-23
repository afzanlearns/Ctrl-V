import { useState, useEffect } from 'react';
import { X, Tag, ArrowUpDown, Layers, Trash2, FolderPlus, Plus, Edit3, Check, PenLine } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { useCollectionsStore } from '../../store/collectionsStore';

export function Sidebar() {
  const { tags, notes } = useNotesStore();
  const { selectedTagId, selectTag, selectedCollectionId, selectCollection, sortMode, setSortMode, sidebarOpen, setSidebarOpen, showTrash, toggleTrash, activeWritePad, setActiveWritePad } = useUIStore();

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => { document.body.classList.remove('sidebar-open'); };
  }, [sidebarOpen]);
  const { collections, addCollection, renameCollection, removeCollection, addNoteToCollection } = useCollectionsStore();
  const [newColName, setNewColName] = useState('');
  const [showNewCol, setShowNewCol] = useState(false);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editColName, setEditColName] = useState('');

  const activeNotes = notes.filter((n) => !n.isDeleted);
  const pinnedCount = activeNotes.filter((n) => n.isPinned).length;

  const tagCounts = tags.map((tag) => ({
    ...tag,
    count: activeNotes.filter((n) => n.tags.includes(tag.id)).length,
  }));

  const sortedCollections = [...collections].sort((a, b) => a.name.localeCompare(b.name));

  const handleCreateCollection = async () => {
    const name = newColName.trim();
    if (!name) return;
    const colors = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    const color = colors[collections.length % colors.length];
    await addCollection(name, color);
    setNewColName('');
    setShowNewCol(false);
  };

  const handleRename = async (id: string) => {
    const name = editColName.trim();
    if (!name) return;
    await renameCollection(id, name);
    setEditingColId(null);
  };

  const handleDeleteCollection = async (id: string) => {
    await removeCollection(id);
    if (selectedCollectionId === id) selectCollection(null);
  };

  const handleDropOnCollection = async (e: React.DragEvent, collectionId: string) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('text/plain');
    if (noteId) {
      await addNoteToCollection(collectionId, noteId);
      useUIStore.getState().setDraggingNoteId(null);
    }
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 z-[70] w-[80%] max-w-[350px] top-0 h-dvh border-r border-gray-200 bg-gray-50 transition-transform duration-300 dark:border-gray-800 dark:bg-gray-950 lg:sticky lg:z-10 lg:translate-x-0 lg:w-60 lg:top-14 lg:h-[calc(100dvh-56px)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          <div className="mb-2 flex items-center justify-between lg:hidden">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Filters</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="mb-4">
            <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Quick Filters
            </h3>
            <div className="flex flex-col gap-0.5">
              <SidebarItem
                icon={<Layers size={14} />}
                label="All Notes"
                count={activeNotes.length}
                active={!showTrash && !selectedTagId && !selectedCollectionId && !activeWritePad}
                onClick={() => { selectTag(null); setActiveWritePad(false); setSidebarOpen(false); }}
              />
              <SidebarItem
                icon={<PenLine size={14} />}
                label="Write Down"
                count={0}
                active={activeWritePad}
                onClick={() => { setActiveWritePad(!activeWritePad); setSidebarOpen(false); }}
              />
              <SidebarItem
                icon={<Trash2 size={14} />}
                label="Trash"
                count={notes.filter((n) => n.isDeleted).length}
                active={showTrash}
                onClick={() => { toggleTrash(); setSidebarOpen(false); }}
              />
            </div>
          </div>

          <div className="mx-3 mb-4 border-t border-gray-200 dark:border-gray-800" />

          {/* Sort */}
          <div className="mb-4">
            <h3 className="mb-2 flex items-center gap-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              <ArrowUpDown size={11} />
              Sort
            </h3>
            <div className="flex flex-col gap-0.5">
              {(['newest', 'oldest', 'pinned'] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => { setSortMode(sort); setSidebarOpen(false); }}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors ${
                    sortMode === sort
                      ? 'bg-sky-50 font-medium text-sky-600 dark:bg-sky-950/50 dark:text-sky-400'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {sort === 'newest' ? 'Newest first' : sort === 'oldest' ? 'Oldest first' : 'By pinned'}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-3 mb-4 border-t border-gray-200 dark:border-gray-800" />

          {/* Tags */}
          <div className="mb-4">
            <h3 className="mb-2 flex items-center gap-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              <Tag size={11} />
              Tags
            </h3>
            <div className="flex flex-col gap-0.5">
              {tagCounts.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => { selectTag(selectedTagId === tag.id ? null : tag.id); setSidebarOpen(false); }}
                  className={`touch-target-sm flex items-center justify-between rounded-lg px-3 py-2.5 text-xs transition-colors ${
                    selectedTagId === tag.id
                      ? 'bg-sky-50 font-medium text-sky-600 dark:bg-sky-950/50 dark:text-sky-400'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </span>
                  {tag.count > 0 && (
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">{tag.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-3 mb-4 border-t border-gray-200 dark:border-gray-800" />

          {/* Collections */}
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between px-3">
              <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                <FolderPlus size={11} />
                Collections
              </h3>
              <button
                onClick={() => { setShowNewCol(!showNewCol); setEditingColId(null); }}
                className="rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="New collection"
              >
                <Plus size={13} />
              </button>
            </div>

            {showNewCol && (
              <div className="mb-2 flex items-center gap-1 px-3">
                <input
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateCollection(); if (e.key === 'Escape') setShowNewCol(false); }}
                  placeholder="Collection name…"
                  className="h-7 w-full rounded-md border border-gray-200 bg-white px-2 text-xs outline-none focus:border-sky-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  autoFocus
                />
                <button onClick={handleCreateCollection} className="rounded p-0.5 text-sky-500 hover:text-sky-600">
                  <Check size={13} />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-0.5">
              {sortedCollections.length === 0 && !showNewCol && (
                <p className="px-3 text-[11px] text-gray-400 dark:text-gray-500">No collections yet</p>
              )}
              {sortedCollections.map((col) => {
                const count = col.noteIds.length;
                const isActive = selectedCollectionId === col.id;
                return (
                  <div
                    key={col.id}
                    data-collection-drop={col.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropOnCollection(e, col.id)}
                    className={`group touch-target-sm flex items-center justify-between rounded-lg px-3 py-2.5 text-xs transition-colors ${
                      isActive
                        ? 'bg-sky-50 font-medium text-sky-600 dark:bg-sky-950/50 dark:text-sky-400'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    {editingColId === col.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={editColName}
                          onChange={(e) => setEditColName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(col.id); if (e.key === 'Escape') setEditingColId(null); }}
                          className="h-6 flex-1 rounded border border-gray-200 bg-white px-1.5 text-xs outline-none focus:border-sky-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button onClick={() => handleRename(col.id)} className="rounded p-0.5 text-sky-500"><Check size={11} /></button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { selectCollection(isActive ? null : col.id); setSidebarOpen(false); }}
                          className="flex items-center gap-2 flex-1 min-w-0"
                        >
                          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                          <span className="truncate">{col.name}</span>
                        </button>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 mr-1">{count}</span>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingColId(col.id); setEditColName(col.name); setShowNewCol(false); }}
                            className="rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Edit3 size={10} />
                          </button>
                          <button
                            onClick={() => handleDeleteCollection(col.id)}
                            className="rounded p-0.5 text-gray-400 hover:text-red-500"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({
  icon, label, count, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`touch-target-sm flex items-center justify-between rounded-lg px-3 py-2.5 text-xs transition-colors ${
        active
          ? 'bg-sky-50 font-medium text-sky-600 dark:bg-sky-950/50 dark:text-sky-400'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
      }`}
    >
      <span className="flex items-center gap-2.5">
        {icon}
        {label}
      </span>
      <span className="text-[11px] text-gray-400 dark:text-gray-500">{count}</span>
    </button>
  );
}
