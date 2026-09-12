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

function ringBand(count: number, radius: number, thickness: number): Particle[] {
  const pts: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2 + (i % 3) * 0.01;
    const jitter = ((i * 17) % 11) / 11;
    const r = radius + (jitter - 0.5) * thickness;
    pts.push({
      x: Math.cos(theta) * r,
      y: ((i % 9) - 4) * 0.006,
      z: Math.sin(theta) * r,
    });
  }
  return pts;
}

function discFill(count: number, maxR: number, minR: number): Particle[] {
  const pts: Particle[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const u = (i + 0.5) / count;
    const r = Math.sqrt(minR * minR + u * (maxR * maxR - minR * minR));
    const theta = i * golden;
    pts.push({
      x: Math.cos(theta) * r,
      y: ((i % 5) - 2) * 0.004,
      z: Math.sin(theta) * r,
    });
  }
  return pts;
}

const SPHERE_SHELLS = [fibonacciSphere(680, 1), fibonacciSphere(360, 0.64), fibonacciSphere(180, 0.34)];
const DISC_BANDS = [
  ringBand(360, 0.99, 0.04),
  ringBand(300, 0.86, 0.035),
  ringBand(240, 0.72, 0.035),
  ringBand(190, 0.58, 0.03),
  ringBand(140, 0.44, 0.03),
  ringBand(90, 0.3, 0.025),
  discFill(860, 0.97, 0.14),
];

export type CoreTint = 'blue' | 'amber' | 'red' | 'ice' | 'slate';

type Rgb = [number, number, number];

function tint(state: WisprState, motion: OrbMotion, core: CoreTint): Rgb {
  if (state === 'disabled' || core === 'slate') return [118, 128, 136];
  if (state === 'error' || core === 'red' || motion === 'alert-flare') return [255, 77, 109];
  if (state === 'listening' || motion === 'listen-ripple') return [0, 229, 255];
  if (state === 'speaking' || motion === 'speak-wave') return [220, 240, 255];
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
  const disc = false;

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
      const pulse = dead ? 0.78 : motion === 'idle-pulse' || motion === 'connect-spin' ? heart : 0.78 + rms * 0.28;
      const scale = Math.min(w, h) * (dim ? 0.34 : hero ? 0.46 : 0.5) * pulse;

      if (!reduce && !dead) {
        const spin =
          motion === 'think-swirl'
            ? 0.024
            : motion === 'connect-spin'
              ? 0.018
              : motion === 'listen-ripple'
                ? 0.01
                : disc
                  ? 0.004
                  : 0.006;
        rot += spin + rms * (motion === 'think-swirl' ? 0.04 : 0.018);
      }

      if (disc) {
        drawDiscBloom(ctx, cx, cy, scale, rms, color, dim);
        drawDiscAnnulus(ctx, cx, cy, scale, rms, color);
        drawDiscRings(ctx, cx, cy, scale, rms, color, t);
        drawDiscParticles(ctx, cx, cy, scale, rot, rms, color, dim, wispr);
        drawEquator(ctx, cx, cy, scale, rms, color);
        if (wispr === 'listening' || motion === 'listen-ripple') drawRipples(ctx, cx, cy, scale, t, rms, accent);
        if (wispr === 'connecting' || motion === 'connect-spin') drawConnectRing(ctx, cx, cy, scale, t, color);
      } else {
        drawBloom(ctx, cx, cy, scale, rms, color, dim, wispr);
        drawHalo(ctx, cx, cy, scale, rms, color, dim, wispr);
        drawGlassBubble(ctx, cx, cy, scale, rms, color, dim, wispr);
        drawNestedGlass(ctx, cx, cy, scale, rms, color, wispr);
        drawSphereShells(ctx, cx, cy, scale, rot, t, rms, color, dim, wispr);
        drawLatitudeRings(ctx, cx, cy, scale, rot, rms, color);
        drawSpeakCore(ctx, cx, cy, scale, rms, color, dim, wispr);
        if (wispr === 'connecting' || motion === 'connect-spin') drawConnectRing(ctx, cx, cy, scale, t, color);
        if (wispr === 'listening' || motion === 'listen-ripple') drawRipples(ctx, cx, cy, scale, t, rms, accent);
        if (hero) {
          drawCrosshair(ctx, cx, cy, scale, color);
          drawEquatorWave(ctx, cx, cy, scale, now, rms, color, wispr === 'speaking');
          drawEquatorRing3D(ctx, cx, cy, scale, now, rms, color);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [motion, dim, hero, core, wispr, disc]);

  return (
    <div className={`talk-orb-wrap${hero ? ' is-hero' : ''}${dim ? ' is-dim' : ''} is-${wispr}${disc ? ' is-disc' : ' is-sphere'}`}>
      <canvas
        className={`talk-orb${hero ? ' is-hero' : ''}${dim ? ' is-dim' : ''} is-${wispr}`}
        ref={canvasRef}
        data-orb={wispr}
        aria-hidden="true"
      />
      {hero && wispr === 'speaking' ? (
        <p className="talk-orb__speak" aria-hidden="true">
          SPEAK
        </p>
      ) : null}
    </div>
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

function drawDiscBloom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rms: number,
  color: Rgb,
  dim: boolean,
) {
  const bloom = ctx.createRadialGradient(cx, cy, scale * 0.18, cx, cy, scale * (1.62 + rms * 0.25));
  const a = dim ? 0.08 : 0.28 + rms * 0.22;
  bloom.addColorStop(0, 'rgba(0,0,0,0)');
  bloom.addColorStop(0.38, `rgba(${color[0]},${color[1]},${color[2]},${a * 0.25})`);
  bloom.addColorStop(0.7, `rgba(${color[0]},${color[1]},${color[2]},${a})`);
  bloom.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(cx, cy, scale * 1.68, 0, Math.PI * 2);
  ctx.fill();
}

function drawDiscAnnulus(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rms: number,
  color: Rgb,
) {
  const glow = ctx.createRadialGradient(cx, cy, scale * 0.72, cx, cy, scale * 1.08);
  glow.addColorStop(0, 'rgba(0,0,0,0)');
  glow.addColorStop(0.55, `rgba(${color[0]},${color[1]},${color[2]},${0.12 + rms * 0.1})`);
  glow.addColorStop(0.82, `rgba(255,255,255,${0.22 + rms * 0.15})`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, scale * 1.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawDiscRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rms: number,
  color: Rgb,
  t: number,
) {
  for (let r = 0; r < 6; r++) {
    const rad = scale * (0.28 + r * 0.14) * (1 + rms * 0.03);
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.14 + (r === 5 ? 0.38 : 0.08) + rms * 0.1})`;
    ctx.lineWidth = r === 5 ? 3 : 1;
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.08);
  ctx.setLineDash([3, 10]);
  ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.2)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, scale * 1.02, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.shadowColor = `rgba(${color[0]},${color[1]},${color[2]},0.85)`;
  ctx.shadowBlur = 22;
  ctx.strokeStyle = `rgba(255,255,255,${0.55 + rms * 0.25})`;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(cx, cy, scale * 0.99, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawDiscParticles(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rot: number,
  rms: number,
  color: Rgb,
  dim: boolean,
  state: WisprState,
) {
  const mute = state === 'disabled' ? 0.28 : 1;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  for (let s = 0; s < DISC_BANDS.length; s++) {
    const band = DISC_BANDS[s];
    const outer = s < 5;
    for (const p of band) {
      const x1 = p.x * cos - p.z * sin;
      const z1 = p.x * sin + p.z * cos;
      const persp = 2.6 / (2.6 + p.y * 8);
      const spread = 1 + rms * (outer ? 0.06 : 0.03);
      const px = cx + x1 * scale * persp * spread;
      const py = cy + z1 * scale * persp * spread * 0.92;
      const rim = Math.abs(Math.hypot(p.x, p.z) - 0.99);
      const a = ((dim ? 0.16 : 0.38) + persp * 0.5 + (outer && rim < 0.1 ? 0.45 : 0.12) + rms * 0.2) * mute;
      const size = (outer ? 2.1 : 1.45) * persp * (dim ? 0.7 : 1 + rms * 0.16);
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${Math.min(1, a)})`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawEquator(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rms: number,
  color: Rgb,
) {
  const glow = ctx.createLinearGradient(cx - scale * 1.15, cy, cx + scale * 1.15, cy);
  glow.addColorStop(0, 'rgba(0,0,0,0)');
  glow.addColorStop(0.2, `rgba(${color[0]},${color[1]},${color[2]},0.15)`);
  glow.addColorStop(0.5, `rgba(255,255,255,${0.85 + rms * 0.15})`);
  glow.addColorStop(0.8, `rgba(${color[0]},${color[1]},${color[2]},0.15)`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.strokeStyle = glow;
  ctx.lineWidth = 2.6 + rms * 2;
  ctx.shadowColor = `rgba(${color[0]},${color[1]},${color[2]},0.85)`;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(cx - scale * 1.12, cy);
  ctx.lineTo(cx + scale * 1.12, cy);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

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
  const bloom = ctx.createRadialGradient(cx, cy, scale * 0.08, cx, cy, scale * (1.7 + rms * 0.35));
  const a = dim ? 0.06 : 0.2 + rms * 0.22;
  bloom.addColorStop(0, `rgba(255,255,255,${a})`);
  bloom.addColorStop(0.32, `rgba(${color[0]},${color[1]},${color[2]},${a * 0.5})`);
  bloom.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(cx, cy, scale * (1.75 + rms * 0.3), 0, Math.PI * 2);
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
  const glowA = state === 'error' ? 0.7 : state === 'disabled' ? 0.08 : dim ? 0.12 : 0.28 + rms * 0.32;
  const halo = ctx.createRadialGradient(cx, cy, scale * 0.16, cx, cy, scale * (1.28 + rms * 0.22));
  halo.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${glowA})`);
  halo.addColorStop(0.5, `rgba(${color[0]},${color[1]},${color[2]},${dim ? 0.05 : 0.1 + rms * 0.08})`);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, scale * (1.28 + rms * 0.2), 0, Math.PI * 2);
  ctx.fill();
}

function drawGlassBubble(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rms: number,
  color: Rgb,
  dim: boolean,
  state: WisprState,
) {
  if (dim || state === 'disabled') return;
  const r = scale * (0.98 + rms * 0.03);
  const rim = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.38, r * 0.04, cx, cy, r);
  rim.addColorStop(0, 'rgba(255,255,255,0.42)');
  rim.addColorStop(0.18, `rgba(${color[0]},${color[1]},${color[2]},0.1)`);
  rim.addColorStop(0.72, 'rgba(0,0,0,0)');
  rim.addColorStop(0.92, `rgba(${color[0]},${color[1]},${color[2]},0.22)`);
  rim.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0.55)`);
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.75)`;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.28)`;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx - r * 0.22, cy - r * 0.42, r * 0.2, r * 0.09, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fill();
}

function drawSpeakCore(
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
  const r = scale * (0.16 + rms * 0.05);
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  core.addColorStop(0, 'rgba(255,255,255,0.95)');
  core.addColorStop(0.45, `rgba(${color[0]},${color[1]},${color[2]},0.85)`);
  core.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  if (dim) return;
  ctx.beginPath();
  ctx.arc(cx, cy, scale * 0.28, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.2)`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawEquatorWave(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  now: number,
  rms: number,
  color: Rgb,
  wide = false,
) {
  const n = wide ? 200 : 160;
  const span = wide ? 1.55 : 1.18;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const x = i / n * 2 - 1;
    const env = 1 - x * x;
    const amp = (0.05 + rms * 0.16) * env * (0.4 + Math.abs(Math.sin(now / 70 + i * 0.38)));
    const px = cx + x * scale * span;
    const py = cy + Math.sin(x * Math.PI * 14 + now / 160) * scale * amp;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.92)`;
  ctx.lineWidth = wide ? 2.4 : 1.8;
  ctx.shadowColor = `rgba(${color[0]},${color[1]},${color[2]},0.8)`;
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawNestedGlass(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rms: number,
  color: Rgb,
  state: WisprState,
) {
  if (state === 'disabled') return;
  for (const f of [0.38, 0.62, 0.82]) {
    ctx.beginPath();
    ctx.arc(cx, cy, scale * f * (1 + rms * 0.03), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.16 + f * 0.12})`;
    ctx.lineWidth = f > 0.7 ? 1.8 : 1.1;
    ctx.stroke();
  }
}

function drawLatitudeRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rot: number,
  rms: number,
  color: Rgb,
) {
  for (const [rx, ry] of [
    [0.98, 0.18],
    [0.78, 0.14],
    [0.58, 0.1],
  ] as const) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, scale * rx * (1 + rms * 0.03), scale * ry, rot * 0.08, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.35)`;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
}

function drawCrosshair(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  color: Rgb,
) {
  ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.18)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy - scale * 1.02);
  ctx.lineTo(cx, cy + scale * 1.02);
  ctx.moveTo(cx - scale * 1.02, cy);
  ctx.lineTo(cx + scale * 1.02, cy);
  ctx.stroke();
}

function drawEquatorRing3D(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  now: number,
  rms: number,
  color: Rgb,
) {
  const n = 180;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wave = Math.sin(a * 16 + now / 90) * (0.035 + rms * 0.09);
    const rx = scale * (0.94 + wave);
    const ry = scale * (0.16 + wave * 0.35);
    const px = cx + Math.cos(a) * rx;
    const py = cy + Math.sin(a) * ry;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.55 + rms * 0.35})`;
  ctx.lineWidth = 1.6;
  ctx.stroke();
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
  for (let i = 0; i < 4; i++) {
    const r = ((t * 0.7 + i * 0.25) % 1) * scale * (1.55 + rms * 0.3);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${(0.28 + rms * 0.2) * (1 - r / (scale * 2))})`;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}

function drawSphereShells(
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

  for (let s = 0; s < SPHERE_SHELLS.length; s++) {
    const ang = rot * speeds[s] + swirl * (0.12 + s * 0.06);
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    for (const p of SPHERE_SHELLS[s]) {
      const x1 = p.x * cos - p.z * sin;
      const z1 = p.x * sin + p.z * cos;
      const persp = 2.15 / (2.15 + z1);
      const spread = 1 + (s === 0 ? rms * 0.16 : s === 1 ? rms * 0.08 : rms * 0.03);
      const px = cx + x1 * scale * persp * spread;
      const py = cy + p.y * scale * persp * spread;
      const a = ((dim ? 0.1 : 0.2) + persp * 0.5 + rms * 0.22) * mute;
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${Math.min(1, a)})`;
      ctx.beginPath();
      ctx.arc(px, py, (s === 2 ? 2.6 : 1.7) * persp * (dim ? 0.65 : 1 + rms * 0.2), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
