export type HudPack = 'cybertruck' | 'phone';

/** Forced pack from the URL. Empty string means auto. */
export function packFromSearch(search = typeof window === 'undefined' ? '' : window.location.search): HudPack | '' {
  const q = new URLSearchParams(search);
  if (q.get('cybertruck') === '1' || q.get('pack') === 'cybertruck') return 'cybertruck';
  if (q.get('cybertruck') === '0' || q.get('pack') === 'phone') return 'phone';
  return '';
}

export function packFromViewport(
  width: number,
  height: number,
  landscapeMq = false,
): HudPack {
  if (height <= 0) return 'phone';
  const ratio = width / height;
  if (landscapeMq || ratio >= 16 / 9 || width >= 1400) return 'cybertruck';
  return 'phone';
}

export function resolveHudPack(): HudPack {
  const forced = packFromSearch();
  if (forced) return forced;
  if (typeof window === 'undefined') return 'cybertruck';
  const landscape = window.matchMedia('(orientation: landscape) and (min-aspect-ratio: 16/9)').matches;
  return packFromViewport(window.innerWidth, window.innerHeight, landscape);
}
