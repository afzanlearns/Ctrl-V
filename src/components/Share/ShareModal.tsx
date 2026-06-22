import { useState } from 'react';
import { X, Link, Download, FileText, Check } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { compressNotesForShare, generateExportJSON, downloadFile } from '../../services/shareLinkService';
import toast from 'react-hot-toast';

export function ShareModal() {
  const { notes, tags } = useNotesStore();
  const { activeModal, closeModal } = useUIStore();

  if (activeModal !== 'share') return null;

  const targetNotes = notes.filter((n) => !n.isDeleted);

  const handleCopyLink = async () => {
    const url = compressNotesForShare(targetNotes, tags);
    if (!url) {
      toast.error('Too many notes to share via link. Try exporting as file.');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleExportJSON = () => {
    const json = generateExportJSON(targetNotes, tags);
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(json, `ctrlv-export-${timestamp}.json`, 'application/json');
    toast.success('Export downloaded');
  };

  const handleExportMarkdown = () => {
    const md = targetNotes
      .map((n) => {
        const noteTags = n.tags
          .map((t) => tags.find((tag) => tag.id === t)?.name)
          .filter(Boolean);
        return `## ${noteTags.length ? `[${noteTags.join(', ')}]` : 'Note'}\n\n${n.content}\n\n*${new Date(n.createdAt).toLocaleString()}*\n`;
      })
      .join('\n---\n\n');
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(md, `ctrlv-export-${timestamp}.md`, 'text/markdown');
    toast.success('Markdown exported');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={closeModal}
      />
      <div className="relative w-full max-w-md animate-scale-in rounded-xl border border-gray-200 bg-white p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Share & Export
            </h2>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {targetNotes.length} note{targetNotes.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <button
            onClick={closeModal}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <ShareOption
            icon={<Link size={16} className="text-sky-600" />}
            iconBg="bg-sky-100 dark:bg-sky-900/50"
            title="Copy Share Link"
            desc="Compressed URL — best for &lt;10 notes"
            onClick={handleCopyLink}
          />
          <ShareOption
            icon={<Download size={16} className="text-emerald-600" />}
            iconBg="bg-emerald-100 dark:bg-emerald-900/50"
            title="Export as JSON"
            desc="Full backup — importable anywhere"
            onClick={handleExportJSON}
          />
          <ShareOption
            icon={<FileText size={16} className="text-amber-600" />}
            iconBg="bg-amber-100 dark:bg-amber-900/50"
            title="Export as Markdown"
            desc="Readable format for docs"
            onClick={handleExportMarkdown}
          />
        </div>
      </div>
    </div>
  );
}

function ShareOption({ icon, iconBg, title, desc, onClick }: { icon: React.ReactNode; iconBg: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800"
    >
      <div className={`rounded-lg ${iconBg} p-2`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{title}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">{desc}</p>
      </div>
    </button>
  );
}
