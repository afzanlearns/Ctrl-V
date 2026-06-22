# ⌘V — Paste. Capture. Move on.

A frontend-only sticky notes PWA. Paste clipboard content into ephemeral sticky notes with local persistence, tag organization, collections, sharing via compressed URLs, and zero backend.

## Features

- **Paste to capture** — global paste listener or ⌘⇧V opens the paste modal with tag/collection/color selection
- **Sticky notes** — warm colors (butter, mint, blush, cream, sage, powder), 3D shadows, hover lift, deterministic color assignment
- **Tags** — auto-detect content type (URL, code, email) on paste, filter canvas by tag, per-note tag assignment
- **Collections** — group notes into named collections, filter by collection, drag notes from canvas onto collection names
- **Trash** — soft-delete with 30-day auto-purge, restore or permanently delete
- **Markdown rendering** — toggle per note to render bold, italic, code, links, headings, lists inline
- **Note color picker** — choose from 6 colors on create or change anytime
- **Drag to reorder** — drag notes within the canvas to reorder them
- **Share & export** — LZ-string compressed URL sharing (<10 notes), JSON backup, Markdown export
- **Dark mode** — toggle in navbar or settings, persisted to IndexedDB
- **PWA** — installable, works offline, service worker caching
- **Privacy-first** — all data stays in your browser, no external requests

## Tech stack

- **Vite 8** + **React 19** + **TypeScript 6**
- **Tailwind CSS v4** with custom sticky-note color palette
- **Zustand** for state management
- **idb** (IndexedDB wrapper) for persistent storage
- **lucide-react** for icons
- **LZ-string** for compressed share links
- **react-hot-toast** for notifications
- **JetBrains Mono** monospace font

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:3000`.

## Build

```bash
npm run build
npm run preview
```

## Deploy

100% static — deploy the `dist/` folder to Vercel, Netlify, or any static host.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| ⌘⇧V | Open paste modal |
| ⌘K | Focus search |
| ⌘, | Open settings |
| ⌘Enter | Save note edit |
| Esc | Close modal |

## Data model

All data lives in IndexedDB (`CtrlVDB`, version 2) with stores for `notes`, `tags`, `collections`, and `settings`. Export as JSON for full backup.

## License

MIT
