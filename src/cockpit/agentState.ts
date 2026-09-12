import { WISPR_LABEL, type WisprState } from './machine';

/** Wispr lock — idle / listening / thinking / speaking / error. */
export type AgentState = WisprState;

export function resolveAgentState(
  voice: WisprState,
  loading: boolean,
  type1Armed: boolean,
): WisprState {
  if (voice === 'error') return 'error';
  if (loading || voice === 'thinking') return 'thinking';
  if (voice === 'listening' || voice === 'speaking') return voice;
  if (type1Armed) return 'thinking';
  return 'idle';
}

export const AGENT_LABEL = WISPR_LABEL;

export const AGENT_WORK: Record<WisprState, string> = {
  idle: 'SYSTEMS NOMINAL',
  listening: 'EARS OPEN',
  thinking: 'COMPUTING',
  speaking: 'ON THE LINE',
  error: 'FAULT',
};
