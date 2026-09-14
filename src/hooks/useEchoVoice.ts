import { useCallback, useEffect, useRef, useState } from 'react';
import type { WisprState } from '../cockpit/machine';
import {
  cancelSpeech,
  diagnoseSpeech,
  prefetchVoices,
  recognitionCtor,
  requestMic,
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
  onLevel?: (level: number) => void;
}

function rmsFrom(analyser: AnalyserNode, buf: Uint8Array): number {
  analyser.getByteTimeDomainData(buf);
  let sum = 0;
  for (let i = 0; i < buf.length; i++) {
    const v = (buf[i] - 128) / 128;
    sum += v * v;
  }
  return Math.min(1, Math.sqrt(sum / buf.length) * 3.2);
}

/**
 * Speak click: getUserMedia (Chrome prompt) → SpeechRecognition.onstart
 * (only then LISTENING) → TTS onstart (only then SPEAKING).
 */
export function useEchoVoice({
  speakEnabled,
  onTranscript,
  onFinalTranscript,
  onState,
  onLevel,
}: UseEchoVoiceOptions) {
  const [voiceState, setVoiceState] = useState<EchoVoiceState>('idle');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<VoiceError>(null);
  const [recLive, setRecLive] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);
  const wantListenRef = useRef(false);
  const recLiveRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  const onStateRef = useRef(onState);
  const onLevelRef = useRef(onLevel);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onFinalTranscriptRef.current = onFinalTranscript;
    onStateRef.current = onState;
    onLevelRef.current = onLevel;
  }, [onTranscript, onFinalTranscript, onState, onLevel]);

  const setState = useCallback((next: EchoVoiceState) => {
    setVoiceState(next);
    onStateRef.current?.(next);
  }, []);

  const stopMicGraph = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioRef.current) {
      void audioRef.current.close();
      audioRef.current = null;
    }
    onLevelRef.current?.(0);
  }, []);

  const startMicGraph = useCallback((stream: MediaStream) => {
    stopMicGraph();
    streamRef.current = stream;
    const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    try {
      const ctx = new AC();
      audioRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      const loop = () => {
        onLevelRef.current?.(rmsFrom(analyser, buf));
        rafRef.current = requestAnimationFrame(loop);
      };
      void ctx.resume();
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      /* analyser optional — STT still runs */
    }
  }, [stopMicGraph]);

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
        },
      });
      if (result === 'blocked') setVoiceError('tts-blocked');
      if (result === 'missing') setVoiceError('tts-missing');
      return result;
    },
    [setState, speakEnabled],
  );

  const stopListening = useCallback(() => {
    wantListenRef.current = false;
    recLiveRef.current = false;
    setRecLive(false);
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    try {
      rec?.abort();
    } catch {
      /* already stopped */
    }
    stopMicGraph();
    setVoiceState((s) => {
      const next = s === 'listening' || s === 'connecting' ? 'idle' : s;
      if (next !== s) onStateRef.current?.(next);
      return next;
    });
  }, [stopMicGraph]);

  const startListening = useCallback(async (): Promise<'listening' | 'denied' | 'missing'> => {
    unlockSpeech();
    stopSpeaking();
    wantListenRef.current = false;
    recLiveRef.current = false;
    setRecLive(false);

    const diag = diagnoseSpeech();
    if (diag.ok === false) {
      setVoiceError(diag.code);
      setState('error');
      return 'missing';
    }

    const Ctor = recognitionCtor();
    if (!Ctor) {
      setVoiceError('mic-missing');
      return 'missing';
    }

    // CONNECTING while the Chrome prompt is up — never LISTENING until onstart.
    setState('connecting');

    // Chrome permission prompt lives on getUserMedia, not on SpeechRecognition.start().
    const mic = await requestMic();
    if (mic === 'insecure') {
      setVoiceError('insecure');
      setState('error');
      return 'missing';
    }
    if (mic === 'denied') {
      setVoiceError('mic-denied');
      setState('error');
      return 'denied';
    }
    if (mic === 'missing') {
      setVoiceError('mic-missing');
      setState('error');
      return 'missing';
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

    const started = new Promise<'listening' | 'denied' | 'missing'>((resolve) => {
      let settled = false;
      const finish = (r: 'listening' | 'denied' | 'missing') => {
        if (settled) return;
        settled = true;
        resolve(r);
      };

      recognition.onstart = () => {
        recLiveRef.current = true;
        setRecLive(true);
        setVoiceError(null);
        setState('listening');
        finish('listening');
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
        if (code === 'aborted') {
          finish(recLiveRef.current ? 'listening' : 'missing');
          return;
        }
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
        recLiveRef.current = false;
        setRecLive(false);
        stopMicGraph();
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setVoiceError('mic-denied');
          finish('denied');
        } else if (code === 'network') {
          setVoiceError('network');
          finish('missing');
        } else {
          setVoiceError('rec-failed');
          finish('missing');
        }
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
        recLiveRef.current = false;
        setRecLive(false);
        if (recognitionRef.current === recognition) recognitionRef.current = null;
        if (!wantListenRef.current) stopMicGraph();
        setVoiceState((s) => {
          const next = s === 'listening' || s === 'connecting' ? 'idle' : s;
          if (next !== s) onStateRef.current?.(next);
          return next;
        });
      };

      recognitionRef.current = recognition;
      startMicGraph(mic);
      try {
        recognition.start();
      } catch {
        setVoiceError('rec-failed');
        wantListenRef.current = false;
        recognitionRef.current = null;
        stopMicGraph();
        setState('error');
        finish('missing');
        return;
      }
      window.setTimeout(() => {
        if (!settled && !recLiveRef.current) {
          wantListenRef.current = false;
          try {
            recognition.abort();
          } catch {
            /* ignore */
          }
          stopMicGraph();
          setVoiceError('rec-failed');
          setState('error');
          finish('missing');
        }
      }, 4000);
    });

    return started;
  }, [setState, startMicGraph, stopMicGraph, stopSpeaking]);

  const toggleListening = useCallback(() => {
    if (voiceState === 'listening' || recLive) {
      stopListening();
      return Promise.resolve('idle' as const);
    }
    return startListening();
  }, [voiceState, recLive, startListening, stopListening]);

  const setThinking = useCallback(
    (thinking: boolean) => {
      if (thinking) setState('thinking');
      else if (voiceState === 'thinking') setState('idle');
    },
    [setState, voiceState],
  );

  useEffect(() => {
    return () => {
      wantListenRef.current = false;
      recLiveRef.current = false;
      stopSpeaking();
      stopMicGraph();
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, [stopMicGraph, stopSpeaking]);

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
    recLive,
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
