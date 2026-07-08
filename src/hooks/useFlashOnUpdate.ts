import { useEffect, useRef, useState } from 'react';

/** Adds a short CSS flash class when `signal` changes (e.g. poll refresh). */
export function useFlashOnUpdate(signal: unknown): boolean {
  const prev = useRef(signal);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prev.current !== undefined && prev.current !== signal) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 900);
      prev.current = signal;
      return () => clearTimeout(t);
    }
    prev.current = signal;
  }, [signal]);

  return flash;
}
