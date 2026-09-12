import { useCallback, useEffect, useRef, useState } from 'react';
import type { WisprState } from '../cockpit/machine';
import {
  cancelSpeech,
  recognitionCtor,
  speakChunks,
  speechReady,
  unlockSpeech,
  type SpeakResult,
} from './speechEngine';

export type EchoVoiceState = WisprState;
export type VoiceError = 'mic-denied' | 'mic-missing' | 'rec-failed' | 'tts-missing' | 'tts-blocked' | null;

interface UseEchoVoiceOptions {
  speakEnabled: boolean;
  onTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onState?: (state: EchoVoiceState) => void;
}

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
  const streamRef = useRef<MediaStream | null>(null);
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
    setSpeechSupported(speechReady());
    setMicSupported(!!recognitionCtor() || !!navigator.mediaDevices?.getUserMedia);
  }, []);

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
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setVoiceState((s) => {
      const next = s === 'listening' ? 'idle' : s;
      if (next !== s) onStateRef.current?.(next);
      return next;
    });
  }, []);

  const startListening = useCallback(async (): Promise<'listening' | 'denied' | 'missing'> => {
    unlockSpeech();
    stopSpeaking();
    stopListening();

    const Ctor = recognitionCtor();
    if (!Ctor && !navigator.mediaDevices?.getUserMedia) {
      setVoiceError('mic-missing');
      setState('error');
      return 'missing';
    }

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setVoiceError('mic-denied');
        setState('error');
        return 'denied';
      }
    }

    if (!Ctor) {
      setVoiceError('mic-missing');
      setState('error');
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return 'missing';
    }

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceError(null);
      setState('listening');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0]?.transcript?.trim() ?? '';
      if (!transcript) return;
      onTranscriptRef.current?.(transcript);
      if (last.isFinal) onFinalTranscriptRef.current?.(transcript);
    };

    recognition.onerror = (ev: Event) => {
      const code = 'error' in ev ? String((ev as SpeechRecognitionErrorEvent).error) : '';
      recognitionRef.current = null;
      if (code === 'not-allowed' || code === 'service-not-allowed') setVoiceError('mic-denied');
      else if (code !== 'aborted' && code !== 'no-speech') setVoiceError('rec-failed');
      setState(code === 'aborted' || code === 'no-speech' ? 'idle' : 'error');
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setVoiceState((s) => {
        const next = s === 'listening' ? 'idle' : s;
        if (next !== s) onStateRef.current?.(next);
        return next;
      });
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      return 'listening';
    } catch {
      setVoiceError('rec-failed');
      setState('error');
      return 'missing';
    }
  }, [setState, stopListening, stopSpeaking]);

  const toggleListening = useCallback(() => {
    if (voiceState === 'listening') {
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
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]);

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
