import LZString from 'lz-string';
import type { Note, Tag, ExportData } from '../store/types';

const MAX_URL_LENGTH = 1500;

export function compressNotesForShare(notes: Note[], tags: Tag[]): string | null {
  const data: ExportData = {
    version: 1,
    exportedAt: Date.now(),
    notes,
    tags,
  };

  const json = JSON.stringify(data);
  const compressed = LZString.compressToBase64(json);

  const url = `${window.location.origin}${window.location.pathname}?import=${compressed}`;
  if (url.length > MAX_URL_LENGTH) {
    return null;
  }
  return url;
}

export function decompressFromShareURL(url: string): ExportData | null {
  try {
    const parsed = new URL(url);
    const importParam = parsed.searchParams.get('import');
    if (!importParam) return null;

    const json = LZString.decompressFromBase64(importParam);
    if (!json) return null;

    const data = JSON.parse(json) as ExportData;
    if (!data.version || !data.notes || !data.tags) return null;
    return data;
  } catch {
    return null;
  }
}

export function generateExportJSON(notes: Note[], tags: Tag[]): string {
  const data: ExportData = {
    version: 1,
    exportedAt: Date.now(),
    notes,
    tags,
  };
  return JSON.stringify(data, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportFile(content: string): ExportData | null {
  try {
    const data = JSON.parse(content);
    if (!data.version || !data.notes || !data.tags) return null;
    return data as ExportData;
  } catch {
    return null;
  }
}
