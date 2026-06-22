import { create } from 'zustand';

export type ModalView = 'none' | 'paste' | 'focus' | 'share' | 'settings' | 'collections';

export type SortMode = 'newest' | 'oldest' | 'pinned';

export interface UIState {
  searchQuery: string;
  selectedTagId: string | null;
  selectedCollectionId: string | null;
  sortMode: SortMode;
  showTrash: boolean;
  activeWritePad: boolean;
  sidebarOpen: boolean;
  activeModal: ModalView;
  focusNoteId: string | null;
  draggingNoteId: string | null;
  darkMode: boolean;

  setSearchQuery: (q: string) => void;
  selectTag: (id: string | null) => void;
  selectCollection: (id: string | null) => void;
  setSortMode: (mode: SortMode) => void;
  toggleTrash: () => void;
  setActiveWritePad: (active: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modal: ModalView, focusNoteId?: string) => void;
  closeModal: () => void;
  setDarkMode: (dark: boolean) => void;
  setDraggingNoteId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: '',
  selectedTagId: null,
  selectedCollectionId: null,
  sortMode: 'newest',
  showTrash: false,
  activeWritePad: false,
  sidebarOpen: false,
  activeModal: 'none',
  focusNoteId: null,
  draggingNoteId: null,
  darkMode: true,

  setSearchQuery: (q) => set({ searchQuery: q }),
  selectTag: (id) => set({ selectedTagId: id, selectedCollectionId: null, showTrash: false, searchQuery: '', activeWritePad: false }),
  selectCollection: (id) => set({ selectedCollectionId: id, selectedTagId: null, showTrash: false, searchQuery: '', activeWritePad: false }),
  setSortMode: (mode) => set({ sortMode: mode }),
  toggleTrash: () => set((s) => ({ showTrash: !s.showTrash, selectedTagId: null, selectedCollectionId: null, searchQuery: '', activeWritePad: false })),
  setActiveWritePad: (active) => set({ activeWritePad: active, showTrash: false, selectedTagId: null, selectedCollectionId: null, searchQuery: '' }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (modal, focusNoteId) => set({ activeModal: modal, focusNoteId: focusNoteId ?? null }),
  closeModal: () => set({ activeModal: 'none', focusNoteId: null }),
  setDarkMode: (dark) => set({ darkMode: dark }),
  setDraggingNoteId: (id) => set({ draggingNoteId: id }),
}));
