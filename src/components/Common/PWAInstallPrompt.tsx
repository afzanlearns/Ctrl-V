import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const isDismissed = () => {
    const until = localStorage.getItem('pwa-dismissed-until');
    return until ? Date.now() < parseInt(until) : false;
  };

  useEffect(() => {
    if (isDismissed()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 1000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-dismissed-until', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  if (!showPrompt || !deferredPrompt || isDismissed()) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[360px] max-w-[calc(100%-32px)] -translate-x-1/2 animate-slide-from-bottom">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15)] dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-sm font-bold text-white shadow-sm">
              V
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Install CTRL+V</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Add to your home screen</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          Quick access from your home screen. Works offline, no app store needed.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-600 hover:shadow-md active:scale-[0.97]"
          >
            <Download size={14} />
            Install Now
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
