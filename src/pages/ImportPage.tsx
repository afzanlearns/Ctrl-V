import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decompressFromShareURL } from '../services/shareLinkService';
import { useNotesStore } from '../store/notesStore';
import { Check, AlertCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';

type Status = 'loading' | 'success' | 'error';

function getInitialStatus(): Status {
  const importParam = new URLSearchParams(window.location.search).get('import');
  return importParam ? 'loading' : 'error';
}

export function ImportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { importData } = useNotesStore();
  const [status, setStatus] = useState<Status>(getInitialStatus);
  const [result, setResult] = useState<{ notesImported: number; tagsImported: number } | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const importParam = searchParams.get('import');
    if (!importParam) return;

    const url = `${window.location.origin}${window.location.pathname}?import=${importParam}`;
    const data = decompressFromShareURL(url);
    if (!data) {
      queueMicrotask(() => setStatus('error'));
      return;
    }

    void importData(data).then(
      (res) => {
        setResult(res);
        queueMicrotask(() => setStatus('success'));
        toast.success(`Imported ${res.notesImported} notes`);
        setSearchParams({}, { replace: true });
      },
      () => {
        queueMicrotask(() => setStatus('error'));
      }
    );
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="mb-4 inline-flex rounded-2xl bg-indigo-100 p-4 dark:bg-indigo-900/50">
              <Download size={24} className="animate-pulse text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Importing notes…</p>
          </>
        )}

        {status === 'success' && result && (
          <>
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-4 dark:bg-emerald-900/50">
              <Check size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
              Import complete
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {result.notesImported} notes and {result.tagsImported} tags imported.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4 inline-flex rounded-2xl bg-red-100 p-4 dark:bg-red-900/50">
              <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
              Import failed
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The share link appears to be invalid or corrupted.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
