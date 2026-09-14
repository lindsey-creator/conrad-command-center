import { useEffect, useRef, useState } from 'react';
import type { OrbMotion } from '../cockpit/machine';

/**
 * Envelope for the reactor. Never opens getUserMedia — a held mic track
 * blocks Chrome webkitSpeechRecognition (audio-capture). That is why Speak
 * died on /?talk=1 (page loaded in listening and grabbed the mic).
 */
export function useAudioPulse(motion: OrbMotion, _liveMic: boolean) {
  const [level, setLevel] = useState(0.12);
  const raf = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const t0 = performance.now();
    const loop = (now: number) => {
      if (cancelled) return;
      const t = (now - t0) / 1000;
      let next = 0.12;
      if (motion === 'listen-ripple') {
        next = 0.38 + Math.abs(Math.sin(t * 5.4)) * 0.42;
      } else if (motion === 'speak-wave') {
        const syl = Math.abs(Math.sin(t * 9.4)) * Math.abs(Math.sin(t * 3.05 + 0.4));
        next = 0.28 + syl * 0.72;
      } else if (motion === 'think-swirl') {
        next = 0.22 + Math.abs(Math.sin(t * 8)) * 0.22;
      } else if (motion === 'alert-flare') {
        next = 0.55 + Math.abs(Math.sin(t * 11)) * 0.4;
      } else if (motion === 'connect-spin') {
        next = 0.18 + Math.abs(Math.sin(t * 3.2)) * 0.16;
      } else if (motion === 'disabled-still') {
        next = 0.06;
      } else {
        next = 0.1 + Math.sin((t * Math.PI * 2) / 4) * 0.08 + 0.08;
      }
      setLevel(Math.min(1, Math.max(0, next)));
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
    };
  }, [motion]);

  return level;
}
