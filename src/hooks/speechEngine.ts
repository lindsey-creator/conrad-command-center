/** Browser speech helpers — Chrome 15s cutoff + voiceschanged race. */

export type SpeakResult = 'spoke' | 'blocked' | 'empty' | 'missing';

let unlocked = false;
let resumeTimer = 0;
let cachedVoice: SpeechSynthesisVoice | null = null;

/** Chrome cuts a single utterance near 15s. Stay well under that. */
const CHUNK_CHARS = 140;
const VOICE_WAIT_MS = 1600;
const CANCEL_GAP_MS = 60;
const BLOCKED_MS = 2400;
const SAFE_UTTER_MS = 12000;
const CHARS_PER_SEC = 13;

export function speechReady(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function recognitionCtor(): (new () => SpeechRecognition) | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

/** Call synchronously inside a click/pointer handler. */
export function unlockSpeech(): boolean {
  if (!speechReady()) return false;
  const synth = window.speechSynthesis;
  try {
    synth.resume();
    if (!unlocked) {
      const prime = new SpeechSynthesisUtterance(' ');
      prime.volume = 0;
      prime.rate = 2;
      prime.pitch = 1;
      prime.lang = 'en-GB';
      synth.speak(prime);
      unlocked = true;
    }
    return true;
  } catch {
    return false;
  }
}

/** Keep synth awake across a long /chat await so the click unlock survives. */
export function warmSpeech(): () => void {
  if (!speechReady()) return () => {};
  const id = window.setInterval(() => {
    try {
      window.speechSynthesis.resume();
    } catch {
      /* ignore */
    }
  }, 1800);
  return () => window.clearInterval(id);
}

function armResume() {
  if (typeof window === 'undefined') return;
  window.clearInterval(resumeTimer);
  resumeTimer = window.setInterval(() => {
    const synth = window.speechSynthesis;
    if (!synth.speaking) {
      window.clearInterval(resumeTimer);
      resumeTimer = 0;
      return;
    }
    if (synth.paused) synth.resume();
  }, 220);
}

export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!speechReady()) return Promise.resolve([]);
  const synth = window.speechSynthesis;
  const have = synth.getVoices();
  if (have.length) return Promise.resolve(have);
  return new Promise((resolve) => {
    const finish = () => {
      synth.removeEventListener('voiceschanged', finish);
      window.clearTimeout(tid);
      resolve(synth.getVoices());
    };
    synth.addEventListener('voiceschanged', finish);
    const tid = window.setTimeout(finish, VOICE_WAIT_MS);
  });
}

export function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  if (cachedVoice && voices.some((v) => v.voiceURI === cachedVoice?.voiceURI)) return cachedVoice;
  const preferred =
    voices.find((v) => v.lang.toLowerCase().startsWith('en-gb') && /daniel|male|google uk/i.test(v.name)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('en-gb')) ??
    voices.find((v) => /daniel|google uk english male|uk english/i.test(v.name)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('en') && !v.localService) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  cachedVoice = preferred ?? null;
  return preferred;
}

export function prefetchVoices() {
  if (!speechReady()) return;
  void waitForVoices().then(pickVoice);
}

function pushWords(out: string[], sentence: string, limit: number) {
  if (sentence.length <= limit) {
    out.push(sentence);
    return;
  }
  let buf = '';
  for (const word of sentence.split(/\s+/)) {
    const next = buf ? `${buf} ${word}` : word;
    if (next.length > limit && buf) {
      out.push(buf);
      buf = word;
    } else {
      buf = next;
    }
  }
  if (buf) out.push(buf);
}

/** Sentence first, then ~140 chars — Chrome cuts utterances near 15s. */
export function splitSpeechChunks(text: string): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const sentence of sentences) {
    if (sentence.length <= CHUNK_CHARS) {
      out.push(sentence);
      continue;
    }
    const clauses = sentence
      .split(/(?<=[,;:—–])\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    for (const clause of clauses) pushWords(out, clause, CHUNK_CHARS);
  }
  const safe: string[] = [];
  const maxChars = Math.max(48, Math.floor((SAFE_UTTER_MS / 1000) * CHARS_PER_SEC));
  for (const chunk of out) {
    if (chunk.length <= maxChars) safe.push(chunk);
    else pushWords(safe, chunk, maxChars);
  }
  return safe;
}

export function speakLine(
  text: string,
  opts: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (reason: string) => void;
    cancel?: boolean;
  } = {},
): Promise<SpeakResult> {
  const line = text.trim();
  if (!line) return Promise.resolve('empty');
  if (!speechReady()) {
    opts.onError?.('missing');
    return Promise.resolve('missing');
  }
  const synth = window.speechSynthesis;
  if (!unlocked) unlockSpeech();

  return waitForVoices().then(async (voices) => {
    if (opts.cancel !== false) {
      synth.cancel();
      await new Promise((r) => window.setTimeout(r, CANCEL_GAP_MS));
    }
    return new Promise<SpeakResult>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(line);
      utterance.rate = 1.02;
      utterance.pitch = 0.95;
      utterance.volume = 1;
      utterance.lang = 'en-GB';
      const preferred = pickVoice(voices.length ? voices : synth.getVoices());
      if (preferred) utterance.voice = preferred;

      let settled = false;
      const finish = (result: SpeakResult) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      utterance.onstart = () => {
        armResume();
        opts.onStart?.();
      };
      utterance.onend = () => {
        opts.onEnd?.();
        finish('spoke');
      };
      utterance.onerror = (ev) => {
        cueTone();
        opts.onStart?.();
        opts.onError?.(ev.error || 'blocked');
        window.setTimeout(() => {
          opts.onEnd?.();
          finish('blocked');
        }, 900);
      };

      try {
        synth.speak(utterance);
        synth.resume();
        armResume();
        window.setTimeout(() => {
          if (!settled && !synth.speaking) {
            opts.onError?.('blocked');
            finish('blocked');
          }
        }, BLOCKED_MS);
      } catch (e) {
        opts.onError?.(e instanceof Error ? e.message : 'blocked');
        finish('blocked');
      }
    });
  });
}

/** Speak a reply in sentence chunks so long Brain answers do not stall TTS. */
export async function speakChunks(
  text: string,
  opts: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (reason: string) => void;
  } = {},
): Promise<SpeakResult> {
  const parts = splitSpeechChunks(text);
  if (!parts.length) return 'empty';
  let started = false;
  let last: SpeakResult = 'empty';
  for (let i = 0; i < parts.length; i++) {
    last = await speakLine(parts[i], {
      cancel: i === 0,
      onStart: () => {
        if (started) return;
        started = true;
        opts.onStart?.();
      },
      onEnd: i === parts.length - 1 ? opts.onEnd : undefined,
      onError: opts.onError,
    });
    if (last === 'missing' || last === 'blocked') {
      opts.onEnd?.();
      return last;
    }
  }
  return last;
}

export function cueTone() {
  if (typeof window === 'undefined') return;
  const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  try {
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);
    osc.connect(gain).connect(ctx.destination);
    void ctx.resume();
    osc.start();
    osc.stop(ctx.currentTime + 0.34);
  } catch {
    /* ignore */
  }
}

export function cancelSpeech() {
  if (!speechReady()) return;
  window.clearInterval(resumeTimer);
  resumeTimer = 0;
  window.speechSynthesis.cancel();
}

export function wasSpeechUnlocked(): boolean {
  return unlocked;
}
