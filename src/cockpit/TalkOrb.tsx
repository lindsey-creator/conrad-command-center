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
  hero?: boolean;
  core?: CoreTint;
}

export function TalkOrb({ motion, level, dim = false, hero = false, core = 'blue' }: TalkOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(level);
  levelRef.current = level;

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
      const nextW = Math.floor(w * dpr);
      const nextH = Math.floor(h * dpr);
      if (canvas.width === nextW && canvas.height === nextH) return;
      canvas.width = nextW;
      canvas.height = nextH;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (now: number) => {
      const level = levelRef.current;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const t = now / 1000;
      const heart = 0.78 + Math.sin((t * Math.PI * 2) / 4) * 0.1;
      const pulse = motion === 'idle-pulse' ? heart : 0.78 + level * 0.36;
      const scale = Math.min(w, h) * (dim ? 0.34 : hero ? 0.7 : 0.5) * pulse;
      if (!reduce) {
        rot +=
          (motion === 'think-swirl' ? 0.03 : motion === 'listen-ripple' ? 0.012 : 0.006) +
          level * (motion === 'think-swirl' ? 0.045 : 0.022);
      }

      const halo = ctx.createRadialGradient(cx, cy, scale * 0.2, cx, cy, scale * (1.35 + level * 0.35));
      const glowA = motion === 'alert-flare' ? 0.7 : dim ? 0.14 : 0.42 + level * 0.38;
      halo.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${glowA})`);
      halo.addColorStop(0.45, `rgba(${color[0]},${color[1]},${color[2]},${dim ? 0.08 : 0.16 + level * 0.12})`);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * (1.38 + level * 0.28), 0, Math.PI * 2);
      ctx.fill();

      for (let r = 0; r < 3; r++) {
        const rad = scale * (0.42 + r * 0.22) * (1 + level * 0.08);
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${(dim ? 0.12 : 0.22 + level * 0.28) * (1 - r * 0.18)})`;
        ctx.lineWidth = r === 0 ? 2.4 : 1.4;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, scale * (0.18 + level * 0.06), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${dim ? 0.4 : 0.9})`;
      ctx.fill();

      if (motion === 'listen-ripple') {
        for (let i = 0; i < 5; i++) {
          const r = ((t * 0.7 + i * 0.2) % 1) * scale * (1.7 + level * 0.4);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,229,255,${(0.34 + level * 0.25) * (1 - r / (scale * 2.1))})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      const swirl = motion === 'think-swirl' ? t * (1.4 + level * 1.2) : 0;
      const cos = Math.cos(rot + swirl * 0.15);
      const sin = Math.sin(rot + swirl * 0.15);

      for (let s = 0; s < SHELLS.length; s++) {
        for (const p of SHELLS[s]) {
          const x1 = p.x * cos - p.z * sin;
          const z1 = p.x * sin + p.z * cos;
          const persp = 2.15 / (2.15 + z1);
          const spread = 1 + (s === 0 ? level * 0.18 : 0);
          const px = cx + x1 * scale * persp * spread;
          const py = cy + p.y * scale * persp * spread;
          const a = (dim ? 0.14 : 0.26) + persp * 0.55 + level * 0.28;
          ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${Math.min(1, a)})`;
          ctx.beginPath();
          ctx.arc(px, py, (s === 2 ? 3.4 : 2.2) * persp * (dim ? 0.65 : 1 + level * 0.25), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (motion === 'speak-wave' || motion === 'alert-flare' || (hero && level > 0.35)) {
        const bars = 72;
        const inner = scale * 0.8;
        for (let i = 0; i < bars; i++) {
          const ang = (i / bars) * Math.PI * 2;
          const n = 0.2 + Math.abs(Math.sin(now / 80 + i * 0.32)) * (0.3 + level);
          const len = (motion === 'alert-flare' ? 26 : 14) + n * (dim ? 14 : 48 + level * 28);
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.28 + n * 0.55})`;
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
  }, [motion, dim, hero, core]);

  return <canvas className={`talk-orb${hero ? ' is-hero' : ''}${dim ? ' is-dim' : ''}`} ref={canvasRef} aria-hidden="true" />;
}
