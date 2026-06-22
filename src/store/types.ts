export interface Note {
  id: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt: number | null;
  colorId: string;
  collectionIds: string[];
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  color: string;
  noteIds: string[];
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface ExportData {
  version: number;
  exportedAt: number;
  notes: Note[];
  tags: Tag[];
  collections?: Collection[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  defaultTagId: string | null;
}

export const DEFAULT_TAGS: Tag[] = [
  { id: 'general', name: 'General', color: '#9CA3AF' },
  { id: 'links', name: 'Links', color: '#0EA5E9' },
  { id: 'code', name: 'Code', color: '#10B981' },
  { id: 'ideas', name: 'Ideas', color: '#F59E0B' },
  { id: 'reminders', name: 'Reminders', color: '#EF4444' },
  { id: 'snippets', name: 'Snippets', color: '#8B5CF6' },
];

export const NOTE_COLORS = [
  { id: 'butter', name: 'Butter', bg: 'bg-butter', border: 'border-butter-border' },
  { id: 'mint', name: 'Mint', bg: 'bg-mint', border: 'border-mint-border' },
  { id: 'blush', name: 'Blush', bg: 'bg-blush', border: 'border-blush-border' },
  { id: 'cream', name: 'Cream', bg: 'bg-cream', border: 'border-cream-border' },
  { id: 'sage', name: 'Sage', bg: 'bg-sage', border: 'border-sage-border' },
  { id: 'powder', name: 'Powder', bg: 'bg-powder', border: 'border-powder-border' },
];

export function getNoteColorClass(colorId: string): string {
  const found = NOTE_COLORS.find((c) => c.id === colorId);
  return found ? found.id : 'cream';
}
