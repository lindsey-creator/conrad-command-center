import { useCallback, useEffect, useRef, useState } from 'react';

export type EchoVoiceState = 'idle' | 'listening' | 'speaking' | 'thinking';

interface UseEchoVoiceOptions {
  speakEnabled: boolean;
  onTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
}

function getRecognitionCtor():
  | (new () => SpeechRecognition)
  | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as Window & {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function useEchoVoice({
  speakEnabled,
  onTranscript,
  onFinalTranscript,
}: UseEchoVoiceOptions) {
  const [voiceState, setVoiceState] = useState<EchoVoiceState>('idle');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onFinalTranscriptRef = useRef(onFinalTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onTranscript, onFinalTranscript]);

  useEffect(() => {
    setSpeechSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    setMicSupported(!!getRecognitionCtor());
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setVoiceState((s) => (s === 'speaking' ? 'idle' : s));
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!speakEnabled || !text.trim() || typeof window === 'undefined') return;
      const synth = window.speechSynthesis;
      if (!synth) return;

      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.rate = 1.02;
      utterance.pitch = 0.95;
      utterance.volume = 1;

      const voices = synth.getVoices();
      const preferred =
        voices.find((v) => /samantha|daniel|alex|google uk english male/i.test(v.name)) ??
        voices.find((v) => v.lang.startsWith('en') && !v.localService) ??
        voices.find((v) => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setVoiceState('speaking');
      utterance.onend = () => {
        utteranceRef.current = null;
        setVoiceState('idle');
      };
      utterance.onerror = () => {
        utteranceRef.current = null;
        setVoiceState('idle');
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
    },
    [speakEnabled],
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setVoiceState((s) => (s === 'listening' ? 'idle' : s));
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    stopSpeaking();
    stopListening();

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setVoiceState('listening');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0]?.transcript?.trim() ?? '';
      if (!transcript) return;
      onTranscriptRef.current?.(transcript);
      if (last.isFinal) {
        onFinalTranscriptRef.current?.(transcript);
      }
    };

    recognition.onerror = () => {
      recognitionRef.current = null;
      setVoiceState('idle');
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setVoiceState((s) => (s === 'listening' ? 'idle' : s));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [stopListening, stopSpeaking]);

  const toggleListening = useCallback(() => {
    if (voiceState === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  }, [voiceState, startListening, stopListening]);

  const setThinking = useCallback((thinking: boolean) => {
    setVoiceState((s) => {
      if (thinking) return 'thinking';
      if (s === 'thinking') return 'idle';
      return s;
    });
  }, []);

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  return {
    voiceState,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    toggleListening,
    setThinking,
    speechSupported,
    micSupported,
  };
}
