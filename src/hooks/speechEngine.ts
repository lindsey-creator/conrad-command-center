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

export type SpeechDiagnosis =
  | { ok: true }
  | { ok: false; code: 'insecure' | 'mic-missing'; message: string };

export type MicRequest = MediaStream | 'denied' | 'missing' | 'insecure';

/** Must run from a click. This is what makes Chrome show the permission prompt. */
export async function requestMic(): Promise<MicRequest> {
  if (typeof window === 'undefined') return 'missing';
  if (!window.isSecureContext) return 'insecure';
  if (!navigator.mediaDevices?.getUserMedia) return 'missing';
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
  } catch (err) {
    const name = err instanceof DOMException ? err.name : '';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
      return 'denied';
    }
    return 'missing';
  }
}

/** Honest preflight — never silent. Chrome STT needs HTTPS + webkitSpeechRecognition. */
export function diagnoseSpeech(): SpeechDiagnosis {
  if (typeof window === 'undefined') {
    return { ok: false, code: 'mic-missing', message: 'NO WINDOW — speech cannot start.' };
  }
  if (!window.isSecureContext) {
    return {
      ok: false,
      code: 'insecure',
      message: 'INSECURE CONTEXT — open the HTTPS Railway URL. Chrome blocks the mic on HTTP.',
    };
  }
  if (!recognitionCtor()) {
    return {
      ok: false,
      code: 'mic-missing',
      message: 'NO SPEECH ENGINE — use Chrome. Type and EXECUTE still reach Claude.',
    };
  }
  return { ok: true };
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

const ROBOT_VOICE =
  /microsoft david|microsoft zira|alex\b|bad news|good news|bells|boing|bubbles|cellos|junior|kathy|organ|princess|ralph|trinoids|whisper|zarvox|dummy|reed|pipe/i;

/** Movie JARVIS = calm British male RP. No licensed Bettany clone unless a real API voice is configured. */
function voiceScore(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  if (ROBOT_VOICE.test(n)) return -80;
  let s = 0;
  if (/daniel/.test(n)) s += 120;
  if (/google uk english male/.test(n)) s += 115;
  if (/arthur|rishi/.test(n)) s += 108;
  if (/(british|uk english|en-gb)/.test(n) && /male/.test(n)) s += 100;
  if (lang.startsWith('en-gb') && /male/.test(n)) s += 90;
  if (lang.startsWith('en-gb')) s += 70;
  if (/(british|uk)\b/.test(n)) s += 40;
  if (/(enhanced|premium|neural)/.test(n)) s += 25;
  if (/samantha|google us english/.test(n)) s += 20;
  if (lang.startsWith('en-us')) s += 8;
  if (lang.startsWith('en')) s += 4;
  return s;
}

export function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  if (cachedVoice && voices.some((v) => v.voiceURI === cachedVoice?.voiceURI)) return cachedVoice;
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const ranked = (en.length ? en : voices).slice().sort((a, b) => voiceScore(b) - voiceScore(a));
  cachedVoice = ranked[0] ?? null;
  return ranked[0];
}

export function describePickedVoice(voices: SpeechSynthesisVoice[] = []): string {
  const v = pickVoice(voices.length ? voices : speechReady() ? window.speechSynthesis.getVoices() : []);
  if (!v) return 'VOICE · DEFAULT';
  const uk = /en-gb|uk|british/i.test(`${v.lang} ${v.name}`);
  const male = /male|daniel|arthur|rishi/i.test(v.name);
  if (uk && male) return `VOICE · ${v.name}`;
  return `VOICE · ${v.name} (no UK male on this device)`;
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
      utterance.rate = 0.95;
      utterance.pitch = 0.92;
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
