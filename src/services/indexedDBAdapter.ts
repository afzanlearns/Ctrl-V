import { openDB, type IDBPDatabase } from 'idb';
import type { Note, Tag, AppSettings, ExportData, Collection } from '../store/types';
import { DEFAULT_TAGS } from '../store/types';

const DB_NAME = 'CtrlVDB';
const DB_VERSION = 2;

interface CtrlVSchema {
  notes: { key: string; value: Note; indexes: { 'by-created': number; 'by-deleted': number } };
  tags: { key: string; value: Tag };
  collections: { key: string; value: Collection };
  settings: { key: string; value: { key: string; value: unknown } };
}

let dbInstance: IDBPDatabase<CtrlVSchema> | null = null;

async function getDB(): Promise<IDBPDatabase<CtrlVSchema>> {
  if (dbInstance) return dbInstance;

  try {
    dbInstance = await openDB<CtrlVSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
          noteStore.createIndex('by-created', 'createdAt');
          noteStore.createIndex('by-deleted', 'isDeleted');
          db.createObjectStore('tags', { keyPath: 'id' });
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (oldVersion < 2) {
          db.createObjectStore('collections', { keyPath: 'id' });
        }
      },
    });

    await verifyDBIntegrity(dbInstance);
    return dbInstance;
  } catch (err) {
    console.error('IndexedDB init failed:', err);
    dbInstance = null;
    throw err;
  }
}

async function verifyDBIntegrity(db: IDBPDatabase<CtrlVSchema>): Promise<boolean> {
  try {
    const tx = db.transaction(['notes', 'tags', 'settings'], 'readonly');
    await Promise.all([
      tx.objectStore('notes').count(),
      tx.objectStore('tags').count(),
      tx.objectStore('settings').count(),
    ]);
    return true;
  } catch {
    console.warn('IndexedDB integrity check failed — resetting');
    indexedDB.deleteDatabase(DB_NAME);
    dbInstance = null;
    return false;
  }
}

// ─── Notes ───

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  return db.getAll('notes');
}

export async function putNote(note: Note): Promise<void> {
  const db = await getDB();
  await db.put('notes', note);
}

export async function putNotesBulk(notes: Note[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('notes', 'readwrite');
  await Promise.all([...notes.map((n) => tx.store.put(n)), tx.done]);
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('notes', id);
}

export async function deleteAllNotes(): Promise<void> {
  const db = await getDB();
  await db.clear('notes');
}

// ─── Tags ───

export async function getAllTags(): Promise<Tag[]> {
  const db = await getDB();
  const tags = await db.getAll('tags');
  if (tags.length === 0) {
    await putTagsBulk(DEFAULT_TAGS);
    return DEFAULT_TAGS;
  }
  return tags;
}

export async function putTag(tag: Tag): Promise<void> {
  const db = await getDB();
  await db.put('tags', tag);
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tags', id);
}

export async function putTagsBulk(tags: Tag[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tags', 'readwrite');
  await Promise.all([...tags.map((t) => tx.store.put(t)), tx.done]);
}

// ─── Collections ───

export async function getAllCollections(): Promise<Collection[]> {
  const db = await getDB();
  return db.getAll('collections');
}

export async function putCollection(col: Collection): Promise<void> {
  const db = await getDB();
  await db.put('collections', col);
}

export async function deleteCollection(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('collections', id);
}

// ─── Settings ───

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const record = await db.get('settings', key);
  return record?.value as T | undefined;
}

export async function putSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value });
}

export async function getAppSettings(): Promise<AppSettings> {
  const theme = await getSetting<'light' | 'dark'>('theme');
  const defaultTagId = await getSetting<string | null>('defaultTagId');
  return {
    theme: theme ?? 'dark',
    defaultTagId: defaultTagId ?? null,
  };
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await putSetting('theme', settings.theme);
  await putSetting('defaultTagId', settings.defaultTagId);
}

// ─── Export / Import ───

export async function exportAllData(): Promise<ExportData> {
  const [notes, tags, collections] = await Promise.all([
    getAllNotes(),
    getAllTags(),
    getAllCollections(),
  ]);
  return { version: 1, exportedAt: Date.now(), notes, tags, collections };
}

export async function importData(data: ExportData): Promise<{ notesImported: number; tagsImported: number; collectionsImported: number }> {
  if (!data.version) throw new Error('Invalid import data');
  await putNotesBulk(data.notes);
  if (data.tags?.length) await putTagsBulk(data.tags);
  if (data.collections?.length) {
    const db = await getDB();
    const tx = db.transaction('collections', 'readwrite');
    await Promise.all([...data.collections.map((c) => tx.store.put(c)), tx.done]);
  }
  return {
    notesImported: data.notes.length,
    tagsImported: data.tags?.length ?? 0,
    collectionsImported: data.collections?.length ?? 0,
  };
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['notes', 'tags', 'settings', 'collections'], 'readwrite');
  await Promise.all([
    tx.objectStore('notes').clear(),
    tx.objectStore('tags').clear(),
    tx.objectStore('settings').clear(),
    tx.objectStore('collections').clear(),
    tx.done,
  ]);
}
