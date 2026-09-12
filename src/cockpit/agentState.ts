import type { EchoVoiceState } from '../hooks/useEchoVoice';

export type AgentState = 'idle' | 'thinking' | 'acting' | 'type1';

export function resolveAgentState(
  voice: EchoVoiceState,
  loading: boolean,
  type1Armed: boolean,
): AgentState {
  if (type1Armed) return 'type1';
  if (loading || voice === 'thinking') return 'thinking';
  if (voice === 'listening' || voice === 'speaking') return 'acting';
  return 'idle';
}

export const AGENT_LABEL: Record<AgentState, string> = {
  idle: 'IDLE',
  thinking: 'THINKING',
  acting: 'ACTING',
  type1: 'TYPE-1',
};

export const AGENT_WORK: Record<AgentState, string> = {
  idle: 'SYSTEMS NOMINAL',
  thinking: 'COMPUTING',
  acting: 'EXECUTING',
  type1: 'TARGET LOCK',
};
