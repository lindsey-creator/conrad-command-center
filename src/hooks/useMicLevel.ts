import { useEffect, useRef } from 'react';

/**
 * Live microphone amplitude, 0..1, for driving the reactor.
 *
 * Returns a ref rather than state on purpose: the value updates every frame
 * and is read inside a canvas loop, so putting it in React state would
 * re-render the tree 60 times a second for nothing.
 *
 * The stream is opened only while `enabled` is true and is fully torn down
 * (tracks stopped, context closed) the moment it goes false, so the browser's
 * mic indicator never stays lit after JARVIS stops listening.
 */
export function useMicLevel(enabled: boolean) {
  const level = useRef(0);

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      level.current = 0;
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let raf = 0;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        // Permission denied or no device — the reactor falls back to its
        // synthetic idle pulse rather than failing.
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const Ctor =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;

      ctx = new Ctor();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);

      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        // RMS around the 128 midpoint, scaled so normal speech lands near 1.
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        level.current = Math.min(1, rms * 4);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      void ctx?.close().catch(() => undefined);
      level.current = 0;
    };
  }, [enabled]);

  return level;
}
