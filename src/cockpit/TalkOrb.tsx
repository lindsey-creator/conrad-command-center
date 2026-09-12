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

export type CoreTint = 'blue' | 'amber' | 'red';

function tint(motion: OrbMotion, core: CoreTint): [number, number, number] {
  if (core === 'red' || motion === 'alert-flare') return [255, 77, 109];
  if (core === 'amber') return [255, 200, 87];
  if (motion === 'speak-wave' || motion === 'listen-ripple') return [0, 229, 255];
  if (motion === 'think-swirl') return [122, 246, 255];
  return [0, 180, 220];
}

interface TalkOrbProps {
  motion: OrbMotion;
  level: number;
  dim?: boolean;
  core?: CoreTint;
}

export function TalkOrb({ motion, level, dim = false, core = 'blue' }: TalkOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let rot = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const color = tint(motion, core);

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
        motion === 'idle-pulse' ? idlePulse : 0.9 + level * 0.12;
      const scale = Math.min(w, h) * (dim ? 0.38 : 0.5) * pulse;
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

      const body = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.05);
      const glowA = motion === 'alert-flare' ? 0.62 : dim ? 0.16 : 0.5;
      body.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${glowA + level * 0.28})`);
      body.addColorStop(0.35, `rgba(${color[0]},${color[1]},${color[2]},${dim ? 0.1 : 0.22})`);
      body.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 1.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, scale * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${dim ? 0.35 : 0.85})`;
      ctx.fill();

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
          const a = (dim ? 0.16 : 0.28) + persp * 0.55 + level * 0.18;
          ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${Math.min(1, a)})`;
          ctx.beginPath();
          ctx.arc(px, py, (s === 2 ? 3.2 : 2.1) * persp * (dim ? 0.7 : 1), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (motion === 'speak-wave' || motion === 'alert-flare') {
        const bars = 84;
        const inner = scale * 0.78;
        for (let i = 0; i < bars; i++) {
          const ang = (i / bars) * Math.PI * 2;
          const n = 0.25 + Math.abs(Math.sin(now / 90 + i * 0.35)) * (0.35 + level);
          const len = (motion === 'alert-flare' ? 28 : 18) + n * (dim ? 16 : 52);
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
  }, [motion, level, dim, core]);

  return <canvas className="talk-orb" ref={canvasRef} aria-hidden="true" />;
}
