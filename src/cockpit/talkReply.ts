import type { ChatResponse } from '../api/brain';

/** Spoken when Brain /chat is fallback or empty (ANTHROPIC_API_KEY unset). */
export const KEY_OFFLINE = 'Sir, the brain key is offline — I cannot think yet.';

/** Spoken when /chat times out or errors. */
export const BRAIN_SILENT = 'Sir, the brain did not respond.';

/** Goldfront-os /chat: mode=fallback and engine=null when ANTHROPIC_API_KEY is unset. */
export function isChatFallback(res: ChatResponse | null | undefined): boolean {
  if (!res) return true;
  if (res.mode === 'fallback') return true;
  if (res.engine == null && !res.answer?.trim()) return true;
  if (res.mode === 'fallback' && res.engine == null) return true;
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
