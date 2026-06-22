import { create } from 'zustand';
import type { Note, Tag, AppSettings, Collection } from './types';
import { DEFAULT_TAGS, NOTE_COLORS } from './types';
import { detectContentType, getTagForDetection } from '../services/autoDetect';
import * as db from '../services/indexedDBAdapter';

const TRASH_DAYS = 30;
const TRASH_MS = TRASH_DAYS * 24 * 60 * 60 * 1000;

function hashColor(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash) + content.charCodeAt(i);
    hash |= 0;
  }
  return NOTE_COLORS[Math.abs(hash) % NOTE_COLORS.length].id;
}

function createNoteObj(content: string, tags: string[], colorId?: string): Note {
  return {
    id: crypto.randomUUID(),
    content,
    tags,
    isPinned: false,
    isDeleted: false,
    deletedAt: null,
    colorId: colorId ?? hashColor(content),
    collectionIds: [],
    order: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

interface NotesState {
  notes: Note[];
  tags: Tag[];
  settings: AppSettings;
  isLoading: boolean;
  isInitialized: boolean;
  deletingId: string | null;

  init: () => Promise<void>;
  addNote: (content: string, tagIds?: string[], colorId?: string, collectionIds?: string[]) => Promise<Note>;
  addNoteFromPaste: (content: string, tagIds?: string[]) => Promise<void>;
  updateNoteById: (id: string, changes: Partial<Omit<Note, 'id' | 'createdAt'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setDeletingId: (id: string | null) => void;
  restoreNote: (id: string) => Promise<void>;
  permanentlyDeleteNote: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
  unarchiveNote: (id: string) => Promise<void>;
  duplicateNote: (id: string) => Promise<void>;
  reorderNotes: (orderedIds: string[]) => Promise<void>;
  purgeOldTrash: () => Promise<void>;
  addTag: (name: string, color: string) => Promise<void>;
  updateTag: (id: string, changes: Partial<Omit<Tag, 'id'>>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  updateSettings: (changes: Partial<AppSettings>) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (data: { version: number; notes: Note[]; tags: Tag[]; collections?: Collection[] }) => Promise<{ notesImported: number; tagsImported: number }>;
  clearAll: () => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  tags: [],
  settings: { theme: 'dark', defaultTagId: null },
  isLoading: true,
  isInitialized: false,
  deletingId: null,

  init: async () => {
    try {
      const [notes, tags, settings] = await Promise.all([
        db.getAllNotes(),
        db.getAllTags(),
        db.getAppSettings(),
      ]);
      set({ notes, tags, settings, isLoading: false, isInitialized: true });
      get().purgeOldTrash();
    } catch (err) {
      console.error('Failed to initialize store:', err);
      set({ tags: DEFAULT_TAGS, isLoading: false, isInitialized: true });
    }
  },

  addNote: async (content, tagIds = [], colorId?: string, collectionIds?: string[]) => {
    const note = createNoteObj(content, tagIds, colorId);
    if (collectionIds) note.collectionIds = collectionIds;
    await db.putNote(note);
    set((s) => ({ notes: [note, ...s.notes] }));
    return note;
  },

  addNoteFromPaste: async (content, tagIds?: string[]) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    let tags: string[];
    if (tagIds && tagIds.length > 0) {
      tags = tagIds;
    } else {
      const { settings } = get();
      const detection = detectContentType(trimmed);
      const autoTag = getTagForDetection(detection.type);
      tags = [autoTag];
      if (settings.defaultTagId && !tags.includes(settings.defaultTagId)) {
        tags.push(settings.defaultTagId);
      }
    }

    const note = createNoteObj(trimmed, tags);
    await db.putNote(note);
    set((s) => ({ notes: [note, ...s.notes] }));
  },

  updateNoteById: async (id, changes) => {
    const { notes } = get();
    const existing = notes.find((n) => n.id === id);
    if (!existing) return;

    const updated = { ...existing, ...changes, updatedAt: Date.now() };
    await db.putNote(updated);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? updated : n)),
    }));
  },

  deleteNote: async (id) => {
    set({ deletingId: id });
    await new Promise((r) => setTimeout(r, 300));
    const { notes } = get();
    const existing = notes.find((n) => n.id === id);
    if (!existing) {
      const allNotes = await db.getAllNotes();
      const note = allNotes.find((n) => n.id === id);
      if (!note) { set({ deletingId: null }); return; }
      const updated = { ...note, isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() };
      await db.putNote(updated);
      set({ deletingId: null });
      return;
    }
    const updated = { ...existing, isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() };
    await db.putNote(updated);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? updated : n)),
      deletingId: null,
    }));
  },

  setDeletingId: (id) => set({ deletingId: id }),

  restoreNote: async (id) => {
    const allNotes = await db.getAllNotes();
    const note = allNotes.find((n) => n.id === id);
    if (!note) return;
    const updated = { ...note, isDeleted: false, deletedAt: null, updatedAt: Date.now() };
    await db.putNote(updated);
    set((s) => ({ notes: [...s.notes, updated] }));
  },

  permanentlyDeleteNote: async (id) => {
    await db.deleteNote(id);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },

  emptyTrash: async () => {
    const allNotes = await db.getAllNotes();
    const trash = allNotes.filter((n) => n.isDeleted);
    await Promise.all(trash.map((n) => db.deleteNote(n.id)));
    set((s) => ({ notes: s.notes.filter((n) => !n.isDeleted) }));
  },

  togglePin: async (id) => {
    const { notes } = get();
    const existing = notes.find((n) => n.id === id);
    if (!existing) return;

    const updated = { ...existing, isPinned: !existing.isPinned, updatedAt: Date.now() };
    await db.putNote(updated);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? updated : n)),
    }));
  },

  archiveNote: async (id) => {
    const { notes } = get();
    const existing = notes.find((n) => n.id === id);
    if (!existing) return;
    const updated = { ...existing, isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() };
    await db.putNote(updated);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? updated : n)),
    }));
  },

  unarchiveNote: async (id) => {
    const allNotes = await db.getAllNotes();
    const note = allNotes.find((n) => n.id === id);
    if (!note) return;
    const updated = { ...note, isDeleted: false, deletedAt: null, updatedAt: Date.now() };
    await db.putNote(updated);
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? updated : n)) }));
  },

  duplicateNote: async (id) => {
    const { notes } = get();
    const original = notes.find((n) => n.id === id);
    if (!original) return;
    const dup = {
      ...original,
      id: crypto.randomUUID(),
      content: original.content + ' (copy)',
      order: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.putNote(dup);
    set((s) => ({ notes: [dup, ...s.notes] }));
  },

  reorderNotes: async (orderedIds) => {
    const { notes } = get();
    const updated = orderedIds.map((id, i) => {
      const note = notes.find((n) => n.id === id);
      return note ? { ...note, order: i, updatedAt: Date.now() } : null;
    }).filter(Boolean) as Note[];
    await db.putNotesBulk(updated);
    set({ notes: updated });
  },

  purgeOldTrash: async () => {
    const allNotes = await db.getAllNotes();
    const cutoff = Date.now() - TRASH_MS;
    const oldTrash = allNotes.filter((n) => n.isDeleted && n.deletedAt && n.deletedAt < cutoff);
    if (oldTrash.length > 0) {
      await Promise.all(oldTrash.map((n) => db.deleteNote(n.id)));
    }
  },

  addTag: async (name, color) => {
    const tag: Tag = { id: name.toLowerCase().replace(/\s+/g, '-'), name, color };
    await db.putTag(tag);
    set((s) => ({ tags: [...s.tags, tag] }));
  },

  updateTag: async (id, changes) => {
    const { tags } = get();
    const existing = tags.find((t) => t.id === id);
    if (!existing) return;
    const updated = { ...existing, ...changes };
    await db.putTag(updated);
    set((s) => ({
      tags: s.tags.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTag: async (id) => {
    await db.deleteTag(id);
    set((s) => ({ tags: s.tags.filter((t) => t.id !== id) }));
  },

  updateSettings: async (changes) => {
    const { settings } = get();
    const updated = { ...settings, ...changes };
    await db.saveAppSettings(updated);
    set({ settings: updated });
  },

  exportData: async () => {
    const { notes, tags } = get();
    const data = { version: 1, exportedAt: Date.now(), notes, tags };
    return JSON.stringify(data, null, 2);
  },

  importData: async (data) => {
    await db.putNotesBulk(data.notes);
    await db.putTagsBulk(data.tags);
    if (data.collections?.length) {
      const allCols = await db.getAllCollections();
      const existingIds = new Set(allCols.map((c) => c.id));
      const newCols = data.collections.filter((c) => !existingIds.has(c.id));
      if (newCols.length) {
        for (const c of newCols) await db.putCollection(c);
      }
    }
    const allNotes = await db.getAllNotes();
    const allTags = await db.getAllTags();
    set({ notes: allNotes.filter((n) => !n.isDeleted), tags: allTags });
    return {
      notesImported: data.notes.length,
      tagsImported: data.tags.length,
    };
  },

  clearAll: async () => {
    await db.clearAllData();
    set({ notes: [], tags: DEFAULT_TAGS });
  },
}));
