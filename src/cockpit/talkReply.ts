import type { ChatResponse } from '../api/brain';

/** Spoken when Brain /chat is fallback or empty. */
export const KEY_OFFLINE = 'Sir, the brain key is offline — I cannot think yet.';

/** Spoken when /chat times out or errors. */
export const BRAIN_SILENT = 'Sir, the brain did not respond.';

/**
 * Offline only when /chat actually failed.
 * Live Claude returns { answer, mode: 'claude', engine: null } — that is PROVEN.
 * Do not treat a null engine as a missing key.
 */
export function isChatFallback(res: ChatResponse | null | undefined): boolean {
  if (!res) return true;
  if (res.mode === 'fallback' || res.mode === 'error') return true;
  return !res.answer?.trim();
}

export function jarvisSpokenLine(res: ChatResponse | null | undefined): {
  line: string;
  fallback: boolean;
} {
  if (!res) return { line: BRAIN_SILENT, fallback: true };
  if (isChatFallback(res)) return { line: KEY_OFFLINE, fallback: true };
  return { line: res.answer!.trim(), fallback: false };
}
