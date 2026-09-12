import { useEffect, useState } from 'react';
import { resolveHudPack, type HudPack } from './pack';

export function useHudPack(): HudPack {
  const [pack, setPack] = useState<HudPack>(() => resolveHudPack());

  useEffect(() => {
    const sync = () => setPack(resolveHudPack());
    const mq = window.matchMedia('(orientation: landscape) and (min-aspect-ratio: 16/9)');
    mq.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    return () => {
      mq.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  return pack;
}
