import { useEffect, useRef } from 'react';
import type { EchoVoiceState } from '../hooks/useEchoVoice';
import './reactor-core.css';

interface ReactorCoreProps {
  /** Brain reachable. Drives brightness and the sweep's teal lock. */
  online?: boolean;
  /** Voice pipeline state — listening lights the waveform ring. */
  state?: EchoVoiceState;
  /** Fraction 0..1 of the connector stack that is live. Fills the data ring. */
  load?: number;
  /** Rendered edge length in px. */
  size?: number;
  label?: string;
  /** Live mic amplitude 0..1 (a ref, read per frame). Drives the core pulse
   *  and the waveform bars so the reactor reacts to the room, not a timer. */
  amplitude?: { current: number };
}

const TAU = Math.PI * 2;
type RGB = { r: number; g: number; b: number };

const CYAN: RGB = { r: 0, g: 207, b: 255 };
const TEAL: RGB = { r: 0, g: 255, b: 247 };
const DIM: RGB = { r: 74, g: 125, b: 153 };

/** #rgb / #rrggbb / rgb(...) -> channels, falling back to the token default. */
function parseColor(raw: string, fallback: RGB): RGB {
  const v = raw.trim();
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  const fn = v.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  if (fn) return { r: +fn[1], g: +fn[2], b: +fn[3] };
  return fallback;
}

/** Palette straight from the CSS tokens, so alert mode repaints the canvas. */
function readPalette(el: Element): { key: RGB; hot: RGB } {
  const cs = getComputedStyle(el);
  return {
    key: parseColor(cs.getPropertyValue('--cyan'), CYAN),
    hot: parseColor(cs.getPropertyValue('--teal'), TEAL),
  };
}

/**
 * Animated arc reactor: concentric counter-rotating rings, a segmented data
 * ring, a radar sweep, a targeting reticle and the six-arc core.
 *
 * Canvas-driven so it stays smooth at any size; it pauses whenever the tab is
 * hidden and renders a single static frame under prefers-reduced-motion.
 */
export function ReactorCore({
  online = false,
  state = 'idle',
  load = 0,
  size = 176,
  label = 'JARVIS core',
  amplitude,
}: ReactorCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Live props read inside the animation loop, so the loop never restarts.
  const propsRef = useRef({ online, state, load, amplitude });
  propsRef.current = { online, state, load, amplitude };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let running = true;
    let palette = readPalette(canvas);

    // Alert mode swaps the CSS tokens; re-read them so the canvas follows.
    const modeObserver = new MutationObserver(() => {
      palette = readPalette(canvas);
      if (reduced) draw(0);
    });
    modeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-hud-mode'],
    });

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const css = canvas.clientWidth || size;
      canvas.width = Math.round(css * dpr);
      canvas.height = Math.round(css * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return css;
    };

    const rgba = (c: RGB, a: number) => `rgba(${c.r},${c.g},${c.b},${a})`;

    const ring = (
      cx: number, cy: number, r: number,
      w: number, alpha: number, dash: number[] = [], rot = 0,
      col: RGB = CYAN,
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.strokeStyle = rgba(col, alpha);
      ctx.lineWidth = w;
      ctx.setLineDash(dash);
      ctx.stroke();
      ctx.restore();
    };

    const arc = (
      cx: number, cy: number, r: number,
      a0: number, a1: number, w: number, col: RGB, alpha: number, glow = 8,
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a1);
      ctx.strokeStyle = rgba(col, alpha);
      ctx.lineWidth = w;
      ctx.shadowColor = rgba(col, 0.8);
      ctx.shadowBlur = glow;
      ctx.stroke();
      ctx.restore();
    };

    const text = (
      str: string, x: number, y: number, px: number, alpha: number, col: RGB = CYAN,
    ) => {
      ctx.save();
      ctx.font = `${px}px 'Share Tech Mono', ui-monospace, monospace`;
      ctx.fillStyle = rgba(col, alpha);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(str, x, y);
      ctx.restore();
    };

    const tick = (
      cx: number, cy: number, r1: number, r2: number,
      angle: number, w: number, alpha: number, col: RGB = CYAN,
    ) => {
      ctx.save();
      ctx.strokeStyle = rgba(col, alpha);
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
      ctx.restore();
    };

    const draw = (ms: number) => {
      const css = canvas.clientWidth || size;
      if (canvas.width === 0) fit();

      const t = reduced ? 0 : ms / 1000;
      const p = propsRef.current;
      const live = p.online;
      const active = live && (p.state === 'listening' || p.state === 'speaking' || p.state === 'thinking');
      const fill = Math.max(0, Math.min(1, p.load));
      const amp = Math.max(0, Math.min(1, p.amplitude?.current ?? 0));
      // Idle-but-offline reads dim slate; live reads the deck's accent pair.
      const key = live ? palette.key : DIM;
      const hot = live ? palette.hot : DIM;
      const lift = live ? 1 : 0.45;

      ctx.clearRect(0, 0, css, css);
      const cx = css / 2;
      const cy = css / 2;
      const base = css * 0.46;

      // 0 — ambient bloom
      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, base);
      bloom.addColorStop(0, rgba(key, (active ? 0.16 : 0.09) * lift));
      bloom.addColorStop(0.55, rgba(key, 0.03 * lift));
      bloom.addColorStop(1, 'transparent');
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(cx, cy, base, 0, TAU);
      ctx.fill();

      // 1 — outer dashed orbit, slow CW, with 16 ticks
      ring(cx, cy, base, 1, 0.22 * lift, [4, 8], t * 0.08, key);
      for (let i = 0; i < 16; i++) {
        const a = (TAU / 16) * i + t * 0.08;
        const major = i % 4 === 0;
        tick(cx, cy, base - (major ? base * 0.09 : base * 0.045), base, a,
          major ? 1.4 : 0.8, (major ? 0.7 : 0.32) * lift, key);
      }

      // 1b — cardinal bearings riding the outer orbit
      if (css >= 120) {
        const marks = ['N', 'E', 'S', 'W'];
        const fs = Math.max(7, Math.round(css * 0.038));
        for (let i = 0; i < 4; i++) {
          const a = (TAU / 4) * i - Math.PI / 2 + t * 0.08;
          text(marks[i], cx + Math.cos(a) * (base - fs * 1.5),
            cy + Math.sin(a) * (base - fs * 1.5), fs, 0.5 * lift, key);
        }
      }

      // 2 — segmented data ring, CCW. Lit segments track the live stack.
      const r2 = base * 0.84;
      const segs = 24;
      const lit = Math.round(segs * fill);
      for (let i = 0; i < segs; i++) {
        const a0 = (TAU / segs) * i - t * 0.15;
        const a1 = a0 + (TAU / segs) * 0.7;
        arc(cx, cy, r2, a0, a1, Math.max(2, css * 0.017),
          i < lit ? hot : key, (i < lit ? 0.7 : 0.16) * lift, 6);
      }

      // 3 — diagnostic ring, CW
      const r3 = base * 0.68;
      ring(cx, cy, r3, 1, 0.32 * lift, [2, 6], t * 0.22, key);
      for (let i = 0; i < 8; i++) {
        const a = (TAU / 8) * i + t * 0.22;
        tick(cx, cy, r3 - base * 0.06, r3 + base * 0.03, a, 1, 0.5 * lift, key);
      }

      // 4 — radar sweep with a trailing cone
      const r4 = base * 0.56;
      const sweep = (t * 1.1) % TAU - Math.PI / 2;
      const CONE = Math.PI * 0.45;
      for (let s = 0; s < 26; s++) {
        const f = s / 26;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r4, sweep - CONE * (1 - f), sweep - CONE * (1 - f - 1 / 26));
        ctx.closePath();
        ctx.fillStyle = rgba(key, f * 0.13 * lift);
        ctx.fill();
      }
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * r4, cy + Math.sin(sweep) * r4);
      ctx.strokeStyle = rgba(hot, 0.85 * lift);
      ctx.lineWidth = 1.4;
      ctx.shadowColor = rgba(hot, 1);
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
      ring(cx, cy, r4, 1, 0.4 * lift, [], 0, key);

      // 5 — inner ring, CCW, with a power arc and a running tip dot
      const r5 = base * 0.4;
      ring(cx, cy, r5, 1.4, 0.45 * lift, [3, 3], -t * 0.4, key);
      const pArc = (live ? 0.35 + fill * 0.65 : 0.2) * TAU;
      arc(cx, cy, r5, -Math.PI / 2, -Math.PI / 2 + pArc, Math.max(2, css * 0.017), hot, 0.75 * lift);
      const tipA = -Math.PI / 2 + pArc;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx + Math.cos(tipA) * r5, cy + Math.sin(tipA) * r5, Math.max(2, css * 0.017), 0, TAU);
      ctx.fillStyle = rgba(hot, 0.9 * lift);
      ctx.shadowColor = rgba(hot, 1);
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      // 6 — targeting reticle: four gapped quadrants + crosshairs
      const r6 = base * 0.28;
      for (let i = 0; i < 4; i++) {
        const a = (TAU / 4) * i;
        arc(cx, cy, r6, a + 0.25, a + Math.PI / 2 - 0.25, 1.8, key, 0.65 * lift, 5);
      }
      ctx.save();
      ctx.strokeStyle = rgba(key, 0.3 * lift);
      ctx.lineWidth = 0.8;
      [0, Math.PI / 2].forEach((a) => {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (r6 - base * 0.05), cy + Math.sin(a) * (r6 - base * 0.05));
        ctx.lineTo(cx - Math.cos(a) * (r6 - base * 0.05), cy - Math.sin(a) * (r6 - base * 0.05));
        ctx.stroke();
      });
      ctx.restore();

      // 7 — the reactor itself: six arcs, inner ring, incandescent core
      const r7 = base * 0.15;
      // Audio-reactive: real amplitude wins whenever the mic is feeding us;
      // otherwise the core falls back to its synthetic breathing pulse.
      const breathe = 0.82 + Math.sin(t * 1.8) * 0.09;
      const pulse = amp > 0.02 ? 0.85 + amp * 0.55 : active ? 1 : breathe;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r7 * 2.6);
      glow.addColorStop(0, rgba(key, (active ? 0.4 : 0.24) * pulse * lift));
      glow.addColorStop(0.5, rgba(key, 0.1 * lift));
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, r7 * 2.6, 0, TAU);
      ctx.fill();

      for (let i = 0; i < 6; i++) {
        const a0 = (TAU / 6) * i + t * (active ? 1.1 : 0.5);
        arc(cx, cy, r7, a0, a0 + TAU / 12, Math.max(3, css * 0.023), key,
          Math.min(1, (active ? 0.95 : 0.78) + amp * 0.4) * lift, 10 + amp * 14);
      }
      ring(cx, cy, r7 * 0.55, 1.4, 0.6 * lift, [], t * 0.8, hot);

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, r7 * 0.85 * pulse);
      core.addColorStop(0, `rgba(235,255,255,${0.95 * lift})`);
      core.addColorStop(0.35, rgba(hot, 0.7 * lift));
      core.addColorStop(0.7, rgba(key, 0.35 * lift));
      core.addColorStop(1, 'transparent');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, r7 * 0.85 * pulse, 0, TAU);
      ctx.fill();

      // 8 — waveform bars while the voice pipeline is listening
      if (p.state === 'listening' && live) {
        const bars = 16;
        const wy = cy + base * 0.66;
        const ww = base * 0.6;
        // Envelope from the live signal; the sine only shapes the bars so a
        // steady tone still looks like a waveform rather than a flat block.
        const env = amp > 0.02 ? 0.25 + amp * 1.5 : 0.35;
        for (let i = 0; i < bars; i++) {
          const bh =
            (Math.sin(t * 8 + i * 0.6) * 0.5 + 0.5) * (base * 0.14) * env + base * 0.02;
          const bx = cx - ww / 2 + (ww / bars) * (i + 0.5);
          ctx.save();
          ctx.fillStyle = rgba(palette.hot, 0.85);
          ctx.shadowColor = rgba(palette.hot, 0.9);
          ctx.shadowBlur = 6;
          ctx.fillRect(bx - 1.5, wy - bh / 2, 3, bh);
          ctx.restore();
        }
      }

      if (running && !reduced) frame = requestAnimationFrame(draw);
    };

    fit();
    if (reduced) {
      draw(0);
    } else {
      frame = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => {
      fit();
      if (reduced) draw(0);
    });
    ro.observe(canvas);

    // Stop burning frames on a backgrounded tab / locked phone.
    const onVisibility = () => {
      if (reduced) return;
      if (document.visibilityState === 'hidden') {
        running = false;
        cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        frame = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      modeObserver.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [size]);

  return (
    <div
      className={`reactor-core${online ? ' reactor-core--online' : ''}`}
      style={{ ['--reactor-size' as string]: `${size}px` }}
      role="img"
      aria-label={label}
    >
      <canvas ref={canvasRef} className="reactor-core__canvas" />
    </div>
  );
}
