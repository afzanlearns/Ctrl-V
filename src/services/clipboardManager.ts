export type PasteSource = 'keyboard' | 'button' | 'input';

export interface PasteResult {
  text: string | null;
  source: PasteSource;
}

export async function readClipboard(): Promise<string | null> {
  try {
    const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
    if (permission.state === 'denied') return null;

    const items = await navigator.clipboard.read();
    for (const item of items) {
      if (item.types.includes('text/plain')) {
        const text = await item.getType('text/plain');
        return await text.text();
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function isClipboardSupported(): boolean {
  return !!navigator.clipboard?.read;
}

export function isPasteEvent(event: React.ClipboardEvent): boolean {
  const items = event.clipboardData?.items;
  if (!items) return false;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type === 'text/plain') return true;
  }
  return false;
}

export function extractTextFromPasteEvent(event: React.ClipboardEvent): string | null {
  const text = event.clipboardData?.getData('text/plain');
  return text || null;
}
