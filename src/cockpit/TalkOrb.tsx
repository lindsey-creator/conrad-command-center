import { useEffect, useRef } from 'react';
import type { OrbMotion, WisprState } from './machine';

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

export type CoreTint = 'blue' | 'amber' | 'red' | 'ice' | 'slate';

type Rgb = [number, number, number];

/** VoiceOrbs-class tints — white primary, cyan only on listen. */
function tint(state: WisprState, motion: OrbMotion, core: CoreTint): Rgb {
  if (state === 'disabled' || core === 'slate') return [118, 128, 136];
  if (state === 'error' || core === 'red' || motion === 'alert-flare') return [255, 77, 109];
  if (state === 'thinking' || core === 'amber' || motion === 'think-swirl') return [255, 200, 87];
  if (state === 'listening' || motion === 'listen-ripple') return [0, 229, 255];
  if (state === 'speaking' || motion === 'speak-wave' || core === 'ice') return [232, 246, 255];
  if (state === 'connecting' || motion === 'connect-spin') return [220, 232, 240];
  return [236, 244, 248];
}

interface TalkOrbProps {
  motion: OrbMotion;
  level: number;
  dim?: boolean;
  hero?: boolean;
  core?: CoreTint;
  state?: WisprState;
}

export function TalkOrb({ motion, level, dim = false, hero = false, core = 'blue', state }: TalkOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(level);
  levelRef.current = level;
  const wispr = state ?? inferState(motion);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let rot = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const color = tint(wispr, motion, core);
    const accent: Rgb = wispr === 'listening' ? [0, 229, 255] : color;

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
      const rms = levelRef.current;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const t = now / 1000;
      const dead = wispr === 'disabled' || motion === 'disabled-still';
      const heart = 0.8 + Math.sin((t * Math.PI * 2) / 4) * 0.08;
      const pulse = dead ? 0.78 : motion === 'idle-pulse' || motion === 'connect-spin' ? heart : 0.78 + rms * 0.36;
      const scale = Math.min(w, h) * (dim ? 0.34 : hero ? 0.7 : 0.5) * pulse;

      if (!reduce && !dead) {
        const spin =
          motion === 'think-swirl'
            ? 0.03
            : motion === 'connect-spin'
              ? 0.02
              : motion === 'listen-ripple'
                ? 0.012
                : 0.006;
        rot += spin + rms * (motion === 'think-swirl' ? 0.045 : 0.022);
      }

      drawBloom(ctx, cx, cy, scale, rms, color, dim, wispr);
      drawHalo(ctx, cx, cy, scale, rms, color, dim, wispr);
      drawGlass(ctx, cx, cy, scale, rms, color, dim, wispr);
      if (wispr === 'connecting' || motion === 'connect-spin') drawConnectRing(ctx, cx, cy, scale, t, color);
      if (wispr === 'listening' || motion === 'listen-ripple') drawRipples(ctx, cx, cy, scale, t, rms, accent);
      drawShells(ctx, cx, cy, scale, rot, t, rms, color, dim, wispr);
      if (wispr === 'speaking' || motion === 'speak-wave' || wispr === 'error' || (hero && rms > 0.35 && !dead)) {
        drawWaveformRing(ctx, cx, cy, scale, now, rms, color, wispr === 'error');
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [motion, dim, hero, core, wispr]);

  return (
    <canvas
      className={`talk-orb${hero ? ' is-hero' : ''}${dim ? ' is-dim' : ''} is-${wispr}`}
      ref={canvasRef}
      data-orb={wispr}
      aria-hidden="true"
    />
  );
}

function inferState(motion: OrbMotion): WisprState {
  if (motion === 'disabled-still') return 'disabled';
  if (motion === 'alert-flare') return 'error';
  if (motion === 'speak-wave') return 'speaking';
  if (motion === 'think-swirl') return 'thinking';
  if (motion === 'listen-ripple') return 'listening';
  if (motion === 'connect-spin') return 'connecting';
  return 'idle';
}

/** EliseyRotar-style bloom — soft field, not a second orb. */
function drawBloom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rms: number,
  color: Rgb,
  dim: boolean,
  state: WisprState,
) {
  if (state === 'disabled') return;
  const bloom = ctx.createRadialGradient(cx, cy, scale * 0.1, cx, cy, scale * (1.85 + rms * 0.4));
  const a = dim ? 0.06 : 0.16 + rms * 0.22;
  bloom.addColorStop(0, `rgba(255,255,255,${a})`);
  bloom.addColorStop(0.35, `rgba(${color[0]},${color[1]},${color[2]},${a * 0.55})`);
  bloom.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(cx, cy, scale * (1.9 + rms * 0.35), 0, Math.PI * 2);
  ctx.fill();
}

function drawHalo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rms: number,
  color: Rgb,
  dim: boolean,
  state: WisprState,
) {
  const glowA = state === 'error' ? 0.7 : state === 'disabled' ? 0.08 : dim ? 0.12 : 0.38 + rms * 0.4;
  const halo = ctx.createRadialGradient(cx, cy, scale * 0.18, cx, cy, scale * (1.42 + rms * 0.32));
  halo.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${glowA})`);
  halo.addColorStop(0.42, `rgba(${color[0]},${color[1]},${color[2]},${dim ? 0.06 : 0.14 + rms * 0.1})`);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, scale * (1.4 + rms * 0.26), 0, Math.PI * 2);
  ctx.fill();
}

function drawGlass(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rms: number,
  color: Rgb,
  dim: boolean,
  state: WisprState,
) {
  const inner = scale * (0.2 + rms * 0.05);
  const glass = ctx.createRadialGradient(cx - scale * 0.12, cy - scale * 0.16, scale * 0.04, cx, cy, scale * 0.52);
  const a = state === 'disabled' ? 0.18 : dim ? 0.28 : 0.55;
  glass.addColorStop(0, `rgba(255,255,255,${dim ? 0.35 : 0.72})`);
  glass.addColorStop(0.35, `rgba(${color[0]},${color[1]},${color[2]},${a})`);
  glass.addColorStop(0.78, `rgba(8,14,18,${dim ? 0.35 : 0.22})`);
  glass.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.arc(cx, cy, scale * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${dim ? 0.35 : 0.88})`;
  ctx.fill();

  for (let r = 0; r < 3; r++) {
    const rad = scale * (0.42 + r * 0.2) * (1 + rms * 0.06);
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${(dim ? 0.08 : 0.16 + rms * 0.2) * (1 - r * 0.22)})`;
    ctx.lineWidth = r === 0 ? 2.2 : 1.2;
    ctx.stroke();
  }
}

function drawConnectRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  t: number,
  color: Rgb,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 1.6);
  ctx.setLineDash([18, 14]);
  ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.55)`;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, scale * 0.92, 0, Math.PI * 1.45);
  ctx.stroke();
  ctx.restore();
}

function drawRipples(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  t: number,
  rms: number,
  color: Rgb,
) {
  for (let i = 0; i < 5; i++) {
    const r = ((t * 0.7 + i * 0.2) % 1) * scale * (1.7 + rms * 0.4);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${(0.32 + rms * 0.25) * (1 - r / (scale * 2.1))})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawShells(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rot: number,
  t: number,
  rms: number,
  color: Rgb,
  dim: boolean,
  state: WisprState,
) {
  const mute = state === 'disabled' ? 0.35 : 1;
  const speeds = [1, -0.74, 1.38];
  const swirl = state === 'thinking' ? t * (1.4 + rms * 1.2) : 0;

  for (let s = 0; s < SHELLS.length; s++) {
    const ang = rot * speeds[s] + swirl * (0.12 + s * 0.06);
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    for (const p of SHELLS[s]) {
      const x1 = p.x * cos - p.z * sin;
      const z1 = p.x * sin + p.z * cos;
      const persp = 2.15 / (2.15 + z1);
      const spread = 1 + (s === 0 ? rms * 0.22 : s === 1 ? rms * 0.1 : rms * 0.04);
      const px = cx + x1 * scale * persp * spread;
      const py = cy + p.y * scale * persp * spread;
      const a = ((dim ? 0.12 : 0.24) + persp * 0.55 + rms * 0.28) * mute;
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${Math.min(1, a)})`;
      ctx.beginPath();
      ctx.arc(px, py, (s === 2 ? 3.4 : 2.2) * persp * (dim ? 0.65 : 1 + rms * 0.25), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawWaveformRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  now: number,
  rms: number,
  color: Rgb,
  alert: boolean,
) {
  const bars = 72;
  const inner = scale * 0.8;
  for (let i = 0; i < bars; i++) {
    const ang = (i / bars) * Math.PI * 2;
    const spat = 0.32 + 0.68 * Math.abs(Math.sin((i / bars) * Math.PI * 8 + now / 160));
    const travel = Math.abs(Math.sin(now / 70 + i * 0.22));
    const n = 0.08 + rms * spat + travel * rms * 0.4;
    const len = (alert ? 22 : 10) + n * (52 + rms * 36);
    ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.22 + n * 0.6})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner);
    ctx.lineTo(cx + Math.cos(ang) * (inner + len), cy + Math.sin(ang) * (inner + len));
    ctx.stroke();
  }
}
