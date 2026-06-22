import type { Note } from '../store/types';

const URL_REGEX = /https?:\/\/[^\s]+/g;
const CODE_BLOCK_REGEX = /```[\s\S]*?```|`[^`]+`/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export type DetectedType = 'url' | 'code' | 'email' | 'text';

export interface DetectionResult {
  type: DetectedType;
  confidence: number;
}

export function detectContentType(content: string): DetectionResult {
  const trimmed = content.trim();

  if (CODE_BLOCK_REGEX.test(trimmed)) {
    return { type: 'code', confidence: 0.9 };
  }

  const urlMatches = trimmed.match(URL_REGEX);
  if (urlMatches && urlMatches[0] === trimmed) {
    return { type: 'url', confidence: 0.95 };
  }
  if (urlMatches && urlMatches.length > 0) {
    return { type: 'url', confidence: 0.7 };
  }

  const emailMatches = trimmed.match(EMAIL_REGEX);
  if (emailMatches && emailMatches[0] === trimmed) {
    return { type: 'email', confidence: 0.95 };
  }

  return { type: 'text', confidence: 0.5 };
}

export function getTagForDetection(type: DetectedType): string {
  switch (type) {
    case 'url': return 'links';
    case 'code': return 'code';
    case 'email': return 'snippets';
    case 'text': return 'general';
  }
}

export function isURL(content: string): boolean {
  try {
    const url = new URL(content.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function getPreview(content: string, maxLen = 80): string {
  const oneLine = content.replace(/\n/g, ' ').trim();
  if (oneLine.length <= maxLen) return oneLine;
  return oneLine.slice(0, maxLen) + '…';
}

export function sortNotes(notes: Note[], sortBy: 'newest' | 'oldest' | 'pinned'): Note[] {
  const sorted = [...notes];
  switch (sortBy) {
    case 'pinned':
      return sorted.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.createdAt - a.createdAt;
      });
    case 'newest':
      return sorted.sort((a, b) => b.createdAt - a.createdAt);
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt - b.createdAt);
  }
}

export function filterNotes(
  notes: Note[],
  searchQuery: string,
  activeTagId: string | null,
  showTrash: boolean
): Note[] {
  return notes.filter((note) => {
    if (showTrash) return note.isDeleted;
    if (note.isDeleted) return false;
    if (activeTagId && !note.tags.includes(activeTagId)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return note.content.toLowerCase().includes(q);
    }
    return true;
  });
}
