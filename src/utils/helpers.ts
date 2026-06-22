import type { Note } from '../store/types';

export function updateNote(note: Note, changes: Partial<Omit<Note, 'id' | 'createdAt'>>): Note {
  return {
    ...note,
    ...changes,
    updatedAt: Date.now(),
  };
}
