import { useEffect, useRef, useState } from 'react';
import type { OrbMotion } from '../cockpit/machine';

/** VAD-ish RMS 0–1. Live mic on listen-ripple; loopback stub otherwise. */
export function useAudioPulse(motion: OrbMotion, liveMic: boolean) {
  const [level, setLevel] = useState(0.1);
  const raf = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;

    const stub = (t0: number) => {
      const loop = (now: number) => {
        if (cancelled) return;
        const t = (now - t0) / 1000;
        const base =
          motion === 'listen-ripple'
            ? 0.4
            : motion === 'speak-wave'
              ? 0.52
              : motion === 'think-swirl'
                ? 0.26
                : motion === 'alert-flare'
                  ? 0.62
                  : 0.12 + Math.sin((t * Math.PI * 2) / 4) * 0.06;
        const wobble = Math.abs(Math.sin(t * (motion === 'think-swirl' ? 8 : 3))) * 0.28;
        setLevel(Math.min(1, base + wobble));
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
            setLevel(Math.min(1, 0.14 + Math.sqrt(sum / data.length) * 2.6));
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
