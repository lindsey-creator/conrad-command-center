import { useEffect, useRef } from 'react';
import type { OrbMotion } from './machine';

interface Particle {
  x: number;
  y: number;
  z: number;
}

function fibonacciSphere(count: number, radius: number): Particle[] {
  const pts: Particle[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push({
      x: Math.cos(theta) * ring * radius,
      y: y * radius,
      z: Math.sin(theta) * ring * radius,
    });
  }
  return pts;
}

const SHELLS = [fibonacciSphere(360, 1), fibonacciSphere(220, 0.66), fibonacciSphere(120, 0.36)];

function tint(motion: OrbMotion, flare: 'amber' | 'red'): [number, number, number] {
  if (motion === 'alert-flare') return flare === 'amber' ? [255, 200, 87] : [255, 77, 109];
  if (motion === 'speak-wave') return [0, 229, 255];
  if (motion === 'listen-ripple') return [0, 229, 255];
  if (motion === 'think-swirl') return [122, 246, 255];
  return [0, 180, 220];
}

interface TalkOrbProps {
  motion: OrbMotion;
  level: number;
  dim?: boolean;
  flare?: 'amber' | 'red';
}

export function TalkOrb({ motion, level, dim = false, flare = 'red' }: TalkOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let rot = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const color = tint(motion, flare);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const t = now / 1000;
      const idlePulse = 0.72 + Math.sin((t * Math.PI * 2) / 4) * 0.14;
      const pulse =
        motion === 'idle-pulse' ? idlePulse : 0.88 + level * 0.18;
      const scale = Math.min(w, h) * (dim ? 0.34 : 0.84) * pulse;
      if (!reduce) {
        rot +=
          motion === 'think-swirl'
            ? 0.028
            : motion === 'listen-ripple'
              ? 0.01
              : motion === 'speak-wave'
                ? 0.008
                : 0.004;
      }

      const glow = ctx.createRadialGradient(cx, cy, scale * 0.06, cx, cy, scale * 1.4);
      const g0 = motion === 'alert-flare' ? 0.4 : dim ? 0.1 : 0.2;
      glow.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${g0 + level * 0.22})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      if (motion === 'listen-ripple') {
        for (let i = 0; i < 4; i++) {
          const r = ((t * 0.55 + i * 0.25) % 1) * scale * 1.6;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,229,255,${0.28 * (1 - r / (scale * 1.6))})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      const swirl = motion === 'think-swirl' ? t * 1.4 : 0;
      const cos = Math.cos(rot + swirl * 0.15);
      const sin = Math.sin(rot + swirl * 0.15);

      for (let s = 0; s < SHELLS.length; s++) {
        for (const p of SHELLS[s]) {
          const x1 = p.x * cos - p.z * sin;
          const z1 = p.x * sin + p.z * cos;
          const persp = 2.15 / (2.15 + z1);
          const px = cx + x1 * scale * persp;
          const py = cy + p.y * scale * persp;
          const a = (dim ? 0.12 : 0.2) + persp * 0.5 + level * 0.15;
          ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${Math.min(1, a)})`;
          ctx.beginPath();
          ctx.arc(px, py, (s === 2 ? 2.2 : 1.4) * persp, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (motion === 'speak-wave' || motion === 'alert-flare') {
        const bars = 72;
        const inner = scale * 0.9;
        for (let i = 0; i < bars; i++) {
          const ang = (i / bars) * Math.PI * 2;
          const n = 0.25 + Math.abs(Math.sin(now / 90 + i * 0.35)) * (0.35 + level);
          const len = (motion === 'alert-flare' ? 16 : 10) + n * 36;
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.3 + n * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner);
          ctx.lineTo(cx + Math.cos(ang) * (inner + len), cy + Math.sin(ang) * (inner + len));
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [motion, level, dim, flare]);

  return <canvas className="talk-orb" ref={canvasRef} aria-hidden="true" />;
}
