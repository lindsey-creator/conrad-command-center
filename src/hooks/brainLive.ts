import { useEffect, useState } from 'react';

type Listener = () => void;

let lastUpdated: Date | null = null;
let browserOnline =
  typeof navigator !== 'undefined' ? navigator.onLine : true;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener();
}

export function touchBrainLive() {
  lastUpdated = new Date();
  notify();
}

export function formatUpdatedAgo(d: Date | null): string {
  if (!d) return '';
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  return `${min}m ago`;
}

export function useBrainLive() {
  const [, tick] = useState(0);

  useEffect(() => {
    const onUpdate = () => tick((n) => n + 1);
    listeners.add(onUpdate);

    const onOnline = () => {
      browserOnline = true;
      onUpdate();
    };
    const onOffline = () => {
      browserOnline = false;
      onUpdate();
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    const clock = setInterval(onUpdate, 1000);

    return () => {
      listeners.delete(onUpdate);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      clearInterval(clock);
    };
  }, []);

  return {
    lastUpdated,
    browserOnline,
    updatedAgo: formatUpdatedAgo(lastUpdated),
  };
}
