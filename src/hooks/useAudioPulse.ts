import { useEffect, useRef, useState } from 'react';
import type { OrbMotion } from '../cockpit/machine';

/** Wispr volume + TTS-like RMS 0–1. Live mic on listen; syllable envelope on speak. */
export function useAudioPulse(motion: OrbMotion, liveMic: boolean) {
  const [level, setLevel] = useState(0.12);
  const raf = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;

    const stub = (t0: number) => {
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
    };

    const start = async () => {
      if (liveMic && motion === 'listen-ripple' && navigator.mediaDevices?.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          ctx = new AudioContext();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          ctx.createMediaStreamSource(stream).connect(analyser);
          const data = new Uint8Array(analyser.frequencyBinCount);
          const loop = () => {
            if (cancelled) return;
            analyser.getByteTimeDomainData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
              const v = (data[i] - 128) / 128;
              sum += v * v;
            }
            setLevel(Math.min(1, 0.16 + Math.sqrt(sum / data.length) * 2.8));
            raf.current = requestAnimationFrame(loop);
          };
          raf.current = requestAnimationFrame(loop);
          return;
        } catch {
          /* loopback */
        }
      }
      stub(performance.now());
    };

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
      stream?.getTracks().forEach((t) => t.stop());
      void ctx?.close();
    };
  }, [motion, liveMic]);

  return level;
}
