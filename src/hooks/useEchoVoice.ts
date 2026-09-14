import { useCallback, useEffect, useRef, useState } from 'react';
import type { WisprState } from '../cockpit/machine';
import {
  cancelSpeech,
  diagnoseSpeech,
  prefetchVoices,
  recognitionCtor,
  speakChunks,
  speechReady,
  unlockSpeech,
  type SpeakResult,
} from './speechEngine';

export type EchoVoiceState = WisprState;
export type VoiceError =
  | 'mic-denied'
  | 'mic-missing'
  | 'rec-failed'
  | 'tts-missing'
  | 'tts-blocked'
  | 'insecure'
  | 'network'
  | null;

interface UseEchoVoiceOptions {
  speakEnabled: boolean;
  onTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onState?: (state: EchoVoiceState) => void;
}

/**
 * Chrome STT: start() must run on the Speak click, and nothing else may
 * hold getUserMedia at the same time. Navaneeth1324/jarvis-ai-assistant pattern.
 */
export function useEchoVoice({
  speakEnabled,
  onTranscript,
  onFinalTranscript,
  onState,
}: UseEchoVoiceOptions) {
  const [voiceState, setVoiceState] = useState<EchoVoiceState>('idle');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<VoiceError>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wantListenRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  const onStateRef = useRef(onState);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onFinalTranscriptRef.current = onFinalTranscript;
    onStateRef.current = onState;
  }, [onTranscript, onFinalTranscript, onState]);

  const setState = useCallback((next: EchoVoiceState) => {
    setVoiceState(next);
    onStateRef.current?.(next);
  }, []);

  useEffect(() => {
    const diag = diagnoseSpeech();
    const tts = speechReady();
    setSpeechSupported(tts);
    setMicSupported(diag.ok);
    prefetchVoices();
    if (diag.ok === false) {
      setVoiceError(diag.code);
      if (!tts) setState('disabled');
    }
  }, [setState]);

  const stopSpeaking = useCallback(() => {
    cancelSpeech();
    setVoiceState((s) => {
      const next = s === 'speaking' ? 'idle' : s;
      if (next !== s) onStateRef.current?.(next);
      return next;
    });
  }, []);

  const speak = useCallback(
    async (text: string): Promise<SpeakResult> => {
      if (!speakEnabled) return 'empty';
      if (!speechReady()) {
        setVoiceError('tts-missing');
        setState('error');
        return 'missing';
      }
      const result = await speakChunks(text, {
        onStart: () => {
          setVoiceError(null);
          setState('speaking');
        },
        onEnd: () => {
          setVoiceState((s) => {
            const next = s === 'speaking' ? 'idle' : s;
            if (next !== s) onStateRef.current?.(next);
            return next;
          });
        },
        onError: () => {
          setVoiceError('tts-blocked');
          setState('error');
        },
      });
      if (result === 'blocked') {
        setVoiceError('tts-blocked');
        setState('error');
      }
      if (result === 'missing') {
        setVoiceError('tts-missing');
        setState('error');
      }
      return result;
    },
    [setState, speakEnabled],
  );

  const stopListening = useCallback(() => {
    wantListenRef.current = false;
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    try {
      rec?.stop();
    } catch {
      /* already stopped */
    }
    setVoiceState((s) => {
      const next = s === 'listening' || s === 'connecting' ? 'idle' : s;
      if (next !== s) onStateRef.current?.(next);
      return next;
    });
  }, []);

  const startListening = useCallback((): Promise<'listening' | 'denied' | 'missing'> => {
    unlockSpeech();
    stopSpeaking();

    const diag = diagnoseSpeech();
    if (diag.ok === false) {
      setVoiceError(diag.code);
      setState(diag.code === 'insecure' ? 'error' : 'error');
      return Promise.resolve('missing');
    }

    const Ctor = recognitionCtor();
    if (!Ctor) {
      setVoiceError('mic-missing');
      setState('error');
      return Promise.resolve('missing');
    }

    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    wantListenRef.current = true;

    recognition.onstart = () => {
      setVoiceError(null);
      setState('listening');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript?.trim() ?? '';
        if (!piece) continue;
        if (event.results[i].isFinal) finalText = `${finalText} ${piece}`.trim();
        else interim = `${interim} ${piece}`.trim();
      }
      const shown = finalText || interim;
      if (shown) onTranscriptRef.current?.(shown);
      if (finalText) {
        wantListenRef.current = false;
        try {
          recognition.stop();
        } catch {
          /* ignore */
        }
        onFinalTranscriptRef.current?.(finalText);
      }
    };

    recognition.onerror = (ev: Event) => {
      const code = 'error' in ev ? String((ev as SpeechRecognitionErrorEvent).error) : '';
      if (code === 'aborted') return;
      if (code === 'no-speech') {
        if (wantListenRef.current) {
          try {
            recognition.start();
          } catch {
            /* already started */
          }
        }
        return;
      }
      recognitionRef.current = null;
      wantListenRef.current = false;
      if (code === 'not-allowed' || code === 'service-not-allowed') setVoiceError('mic-denied');
      else if (code === 'network') setVoiceError('network');
      else setVoiceError('rec-failed');
      setState('error');
    };

    recognition.onend = () => {
      if (wantListenRef.current && recognitionRef.current === recognition) {
        try {
          recognition.start();
          return;
        } catch {
          /* fall through */
        }
      }
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setVoiceState((s) => {
        const next = s === 'listening' || s === 'connecting' ? 'idle' : s;
        if (next !== s) onStateRef.current?.(next);
        return next;
      });
    };

    recognitionRef.current = recognition;
    setState('connecting');
    try {
      recognition.start();
      return Promise.resolve('listening');
    } catch {
      setVoiceError('rec-failed');
      setState('error');
      wantListenRef.current = false;
      recognitionRef.current = null;
      return Promise.resolve('missing');
    }
  }, [setState, stopSpeaking]);

  const toggleListening = useCallback(() => {
    if (voiceState === 'listening' || voiceState === 'connecting') {
      stopListening();
      return Promise.resolve('idle' as const);
    }
    return startListening();
  }, [voiceState, startListening, stopListening]);

  const setThinking = useCallback(
    (thinking: boolean) => {
      setState(thinking ? 'thinking' : voiceState === 'thinking' ? 'idle' : voiceState);
    },
    [setState, voiceState],
  );

  useEffect(() => {
    return () => {
      wantListenRef.current = false;
      stopSpeaking();
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, [stopSpeaking]);

  useEffect(() => {
    if (!speechReady()) return;
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  return {
    voiceState,
    voiceError,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    toggleListening,
    unlock: unlockSpeech,
    setThinking,
    speechSupported,
    micSupported,
  };
}
