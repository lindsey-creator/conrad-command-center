/** Browser speech helpers — unlock in the click, then TTS can survive await. */

export type SpeakResult = 'spoke' | 'blocked' | 'empty' | 'missing';

let unlocked = false;
let resumeTimer = 0;

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
    const prime = new SpeechSynthesisUtterance('.');
    prime.volume = 0;
    prime.rate = 2;
    prime.pitch = 1;
    synth.speak(prime);
    unlocked = true;
    return true;
  } catch {
    return false;
  }
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

export function splitSpeechChunks(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
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

  const waitVoices = !synth.getVoices().length
    ? new Promise<void>((resolve) => {
        const done = () => resolve();
        synth.addEventListener('voiceschanged', done, { once: true });
        window.setTimeout(done, 400);
      })
    : Promise.resolve();

  return waitVoices.then(() => new Promise((resolve) => {
    if (opts.cancel !== false) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.rate = 1.02;
    utterance.pitch = 0.95;
    utterance.volume = 1;
    utterance.lang = 'en-GB';

    const voices = synth.getVoices();
    const preferred =
      voices.find((v) => v.lang.toLowerCase().startsWith('en-gb')) ??
      voices.find((v) => /daniel|google uk english male|uk english/i.test(v.name)) ??
      voices.find((v) => v.lang.startsWith('en') && !v.localService) ??
      voices.find((v) => v.lang.startsWith('en'));
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
      }, 800);
    } catch (e) {
      opts.onError?.(e instanceof Error ? e.message : 'blocked');
      finish('blocked');
    }
  }));
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
