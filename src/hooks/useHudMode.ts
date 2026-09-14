import { useCallback, useEffect, useState } from 'react';

export type HudMode = 'normal' | 'alert';

const ATTR = 'data-hud-mode';
const STORE = 'jarvis:hud-mode';

/** Phrases that flip the deck into crimson defense posture, and back out. */
const ENTER = [/\bdefen[cs]e protocol\b/i, /\balert mode\b/i, /\bgo to red\b/i, /\bbattle stations\b/i];
const EXIT = [/\bstand down\b/i, /\ball clear\b/i, /\bnormal mode\b/i, /\bexit alert\b/i];

/**
 * Reads a typed command and returns the HUD mode it requests, or null when the
 * text is an ordinary message for the brain. Kept pure so the command bar can
 * check it before deciding whether to spend a round-trip on the model.
 */
export function hudModeFromCommand(text: string): HudMode | null {
  const t = text.trim();
  if (!t) return null;
  if (ENTER.some((re) => re.test(t))) return 'alert';
  if (EXIT.some((re) => re.test(t))) return 'normal';
  return null;
}

/**
 * Deck-wide theme posture. Sets `data-hud-mode` on <html>, which re-points the
 * palette tokens — so every panel, bracket, chip and canvas turns crimson at
 * once rather than each component knowing about alert state.
 */
export function useHudMode() {
  const [mode, setModeState] = useState<HudMode>(() => {
    if (typeof document === 'undefined') return 'normal';
    try {
      return localStorage.getItem(STORE) === 'alert' ? 'alert' : 'normal';
    } catch {
      return 'normal';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute(ATTR, mode);
    try {
      localStorage.setItem(STORE, mode);
    } catch {
      /* private mode — the attribute above is what actually matters */
    }
  }, [mode]);

  const setMode = useCallback((next: HudMode) => setModeState(next), []);
  const toggle = useCallback(
    () => setModeState((m) => (m === 'alert' ? 'normal' : 'alert')),
    [],
  );

  return { mode, setMode, toggle };
}
