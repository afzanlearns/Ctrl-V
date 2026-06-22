import { create } from 'zustand';
import type { Collection } from './types';
import { getAllCollections, putCollection, deleteCollection } from '../services/indexedDBAdapter';

interface CollectionsState {
  collections: Collection[];
  loading: boolean;
  loaded: boolean;
  loadCollections: () => Promise<void>;
  addCollection: (name: string, color: string) => Promise<Collection>;
  renameCollection: (id: string, name: string) => Promise<void>;
  removeCollection: (id: string) => Promise<void>;
  addNoteToCollection: (collectionId: string, noteId: string) => Promise<void>;
  removeNoteFromCollection: (collectionId: string, noteId: string) => Promise<void>;
  getCollection: (id: string) => Collection | undefined;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: [],
  loading: false,
  loaded: false,

  loadCollections: async () => {
    set({ loading: true });
    const collections = await getAllCollections();
    set({ collections, loading: false, loaded: true });
  },

  addCollection: async (name: string, color: string) => {
    const col: Collection = {
      id: crypto.randomUUID(),
      name,
      color,
      noteIds: [],
      createdAt: Date.now(),
    };
    await putCollection(col);
    set((s) => ({ collections: [...s.collections, col] }));
    return col;
  },

  renameCollection: async (id: string, name: string) => {
    const col = get().collections.find((c) => c.id === id);
    if (!col) return;
    const updated = { ...col, name };
    await putCollection(updated);
    set((s) => ({ collections: s.collections.map((c) => (c.id === id ? updated : c)) }));
  },

  removeCollection: async (id: string) => {
    await deleteCollection(id);
    set((s) => ({ collections: s.collections.filter((c) => c.id !== id) }));
  },

  addNoteToCollection: async (collectionId: string, noteId: string) => {
    const col = get().collections.find((c) => c.id === collectionId);
    if (!col || col.noteIds.includes(noteId)) return;
    const updated = { ...col, noteIds: [...col.noteIds, noteId] };
    await putCollection(updated);
    set((s) => ({ collections: s.collections.map((c) => (c.id === collectionId ? updated : c)) }));
  },

  removeNoteFromCollection: async (collectionId: string, noteId: string) => {
    const col = get().collections.find((c) => c.id === collectionId);
    if (!col) return;
    const updated = { ...col, noteIds: col.noteIds.filter((nid) => nid !== noteId) };
    await putCollection(updated);
    set((s) => ({ collections: s.collections.map((c) => (c.id === collectionId ? updated : c)) }));
  },

  getCollection: (id: string) => {
    return get().collections.find((c) => c.id === id);
  },
}));
