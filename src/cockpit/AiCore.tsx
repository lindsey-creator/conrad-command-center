import { useEffect, useRef } from 'react';

interface AiCoreProps {
  listening?: boolean;
  thinking?: boolean;
  speaking?: boolean;
  alert?: boolean;
  /** 0–1 audio pulse. Ambient motion continues at 0. */
  level?: number;
  compact?: boolean;
  status?: string;
  onActivate?: () => void;
}

/**
 * Jenman (Davood121/jenman, MIT) arc reactor — canvas rings, N/E/S/W orbit,
 * segmented data arc, radar sweep, targeting reticle, animated power dot.
 * Labels stay honest: no invented speed / altitude / range.
 */
export function AiCore({
  listening = false,
  thinking = false,
  speaking = false,
  alert = false,
  level = 0,
  compact = false,
  status = 'STANDBY',
  onActivate,
}: AiCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const timeRef = useRef(0);
  const levelRef = useRef(level);
  levelRef.current = level;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const cap = compact ? 280 : 560;
      const size = Math.min(parent.clientWidth, parent.clientHeight, cap);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(160, size) * dpr;
      canvas.height = Math.max(160, size) * dpr;
      canvas.style.width = `${Math.max(160, size)}px`;
      canvas.style.height = `${Math.max(160, size)}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const TAU = Math.PI * 2;
    const cyan = { r: 0, g: 207, b: 255 };
    const teal = { r: 0, g: 255, b: 247 };
    const red = { r: 255, g: 60, b: 60 };
    const C = alert ? red : cyan;
    const T = alert ? red : teal;
    const rgba = (col: typeof C, a: number) => `rgba(${col.r},${col.g},${col.b},${a})`;

    const drawRing = (
      cx: number,
      cy: number,
      r: number,
      lineW: number,
      alpha: number,
      dash: number[] = [],
      rotation = 0,
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.strokeStyle = rgba(C, alpha);
      ctx.lineWidth = lineW;
      ctx.setLineDash(dash);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    const drawArcFill = (
      cx: number,
      cy: number,
      r: number,
      startAngle: number,
      endAngle: number,
      lineW: number,
      col: typeof C,
      alpha: number,
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.strokeStyle = rgba(col, alpha);
      ctx.lineWidth = lineW;
      ctx.shadowColor = rgba(C, 0.8);
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    };

    const drawText = (text: string, x: number, y: number, size: number, alpha: number) => {
      ctx.save();
      ctx.font = `${size}px 'Share Tech Mono', monospace`;
      ctx.fillStyle = rgba(C, alpha);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    const drawTick = (
      cx: number,
      cy: number,
      r1: number,
      r2: number,
      angle: number,
      lineW: number,
      alpha: number,
    ) => {
      ctx.save();
      ctx.strokeStyle = rgba(C, alpha);
      ctx.lineWidth = lineW;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
      ctx.restore();
    };

    const draw = (ts: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      timeRef.current = ts;
      const t = ts / 1000;
      const pulse = Math.min(1, Math.max(0, levelRef.current));
      const hot = listening || speaking || thinking;
      const audio = Math.round((0.22 + pulse * 0.78) * 100);

      ctx.clearRect(0, 0, w, h);
      const base = w * 0.42;

      {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.9);
        g.addColorStop(0, rgba(C, hot ? 0.12 + pulse * 0.1 : 0.06));
        g.addColorStop(0.5, rgba(C, 0.03));
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, base * 0.9, 0, TAU);
        ctx.fill();
      }

      drawRing(cx, cy, base, 1, 0.18, [4, 8], t * 0.08);
      for (let i = 0; i < 16; i++) {
        const a = (TAU / 16) * i + t * 0.08;
        const major = i % 4 === 0;
        drawTick(cx, cy, base - (major ? 14 : 7), base, a, major ? 1.5 : 0.8, major ? 0.7 : 0.35);
      }
      const cardinals = ['N', 'E', 'S', 'W'];
      for (let i = 0; i < 4; i++) {
        const a = (TAU / 4) * i - Math.PI / 2 + t * 0.08;
        drawText(
          cardinals[i],
          cx + Math.cos(a) * (base + 16),
          cy + Math.sin(a) * (base + 16),
          Math.round(w * 0.022),
          0.45,
        );
      }

      const r2 = base * 0.84;
      const segCount = 24;
      const rotation2 = -t * 0.15;
      const lit = Math.round(segCount * audio / 100);
      for (let i = 0; i < segCount; i++) {
        const a0 = (TAU / segCount) * i + rotation2;
        const a1 = a0 + (TAU / segCount) * 0.72;
        const active = i < lit;
        drawArcFill(cx, cy, r2, a0, a1, 3, active ? T : C, active ? 0.65 : 0.18);
      }

      const r3 = base * 0.68;
      drawRing(cx, cy, r3, 1, 0.3, [2, 6], t * 0.22);
      for (let i = 0; i < 8; i++) {
        const a = (TAU / 8) * i + t * 0.22;
        drawTick(cx, cy, r3 - 10, r3 + 5, a, 1, 0.55);
      }
      const r3Labels = [
        `ARC ${audio}%`,
        listening ? 'MIC LIVE' : thinking ? 'THINK' : speaking ? 'VOICE' : 'IDLE',
        alert ? 'DEFENSE' : 'NOMINAL',
        status.slice(0, 10),
      ];
      for (let i = 0; i < 4; i++) {
        const a = (TAU / 4) * i - Math.PI / 2 + t * 0.22;
        drawText(
          r3Labels[i],
          cx + Math.cos(a) * (r3 + 22),
          cy + Math.sin(a) * (r3 + 22),
          Math.round(w * 0.018),
          0.6,
        );
      }

      const r4 = base * 0.56;
      {
        const sweepAngle = (t * 1.2) % TAU - Math.PI / 2;
        const SWEEP_ARC = Math.PI * 0.45;
        ctx.save();
        for (let step = 0; step < 30; step++) {
          const frac = step / 30;
          const a0 = sweepAngle - SWEEP_ARC * (1 - frac);
          const a1 = sweepAngle - SWEEP_ARC * (1 - frac - 1 / 30);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, r4, a0, a1);
          ctx.closePath();
          ctx.fillStyle = rgba(C, frac * 0.12);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweepAngle) * r4, cy + Math.sin(sweepAngle) * r4);
        ctx.strokeStyle = rgba(C, 0.85);
        ctx.lineWidth = 1.5;
        ctx.shadowColor = rgba(C, 1);
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
        drawRing(cx, cy, r4, 1, 0.4);
        for (let i = 0; i < 4; i++) drawTick(cx, cy, r4 - 6, r4 + 4, (TAU / 4) * i, 1, 0.5);
      }

      const r5 = base * 0.4;
      drawRing(cx, cy, r5, 1.5, 0.45, [3, 3], -t * 0.4);
      {
        const pArc = (audio / 100) * TAU;
        drawArcFill(cx, cy, r5, -Math.PI / 2, -Math.PI / 2 + pArc, 3, T, 0.75);
        const tipA = -Math.PI / 2 + pArc - t * 0.4;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(tipA) * r5, cy + Math.sin(tipA) * r5, 3, 0, TAU);
        ctx.fillStyle = rgba(T, 0.9);
        ctx.shadowColor = rgba(T, 1);
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      const r6 = base * 0.28;
      drawRing(cx, cy, r6, 1, 0.35);
      for (let i = 0; i < 4; i++) {
        const a = (TAU / 4) * i;
        const gap = 0.25;
        drawArcFill(cx, cy, r6, a + gap, a + Math.PI / 2 - gap, 2, C, 0.7);
      }
      [0, Math.PI / 2].forEach((a) => {
        ctx.save();
        ctx.strokeStyle = rgba(C, 0.3);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (r6 - 8), cy + Math.sin(a) * (r6 - 8));
        ctx.lineTo(cx - Math.cos(a) * (r6 - 8), cy - Math.sin(a) * (r6 - 8));
        ctx.stroke();
        ctx.restore();
      });
      for (let i = 0; i < 4; i++) {
        drawTick(cx, cy, r6 - 10, r6, (TAU / 4) * i + Math.PI / 4, 1, 0.5);
      }

      const r7 = base * 0.14;
      const breathe = 1 + Math.sin(t * 2.2) * 0.06 + pulse * 0.12;
      {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r7 * 2.5 * breathe);
        g.addColorStop(0, rgba(C, hot ? 0.35 : 0.22));
        g.addColorStop(0.5, rgba(C, hot ? 0.12 : 0.07));
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r7 * 2.5 * breathe, 0, TAU);
        ctx.fill();
      }
      for (let i = 0; i < 6; i++) {
        const a0 = (TAU / 6) * i + t * 0.5;
        drawArcFill(cx, cy, r7, a0, a0 + TAU / 12, 4, C, hot ? 0.95 : 0.75);
      }
      drawRing(cx, cy, r7 * 0.55, 1.5, 0.6, [], t * 0.8);
      {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r7 * 0.4);
        g.addColorStop(0, rgba(C, 0.95));
        g.addColorStop(0.5, rgba(C, 0.5));
        g.addColorStop(1, rgba(C, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r7 * 0.4, 0, TAU);
        ctx.fill();
      }

      if (thinking) {
        for (let i = 0; i < 5; i++) {
          const a = t * 2.4 + (TAU / 5) * i;
          const rr = r7 * 2.1;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2.4, 0, TAU);
          ctx.fillStyle = rgba(T, 0.85);
          ctx.fill();
        }
      }

      if (listening || speaking) {
        const bars = 18;
        const wY = cy + base * 0.62;
        const wW = base * 0.55;
        for (let i = 0; i < bars; i++) {
          const bh = (Math.sin(t * 8 + i * 0.6) * 0.5 + 0.5) * (18 + pulse * 22) + 4;
          const bx = cx - wW / 2 + (wW / bars) * i + wW / bars / 2;
          ctx.save();
          ctx.fillStyle = rgba(T, 0.85);
          ctx.shadowColor = rgba(T, 0.9);
          ctx.shadowBlur = 6;
          ctx.fillRect(bx - 1.5, wY - bh / 2, 3, bh);
          ctx.restore();
        }
      }

      if (!compact) {
        const fs = Math.round(w * 0.018);
        drawText('SUIT: MARK III', cx - base * 0.62, cy - base * 0.78, fs, 0.5);
        drawText(`STATUS: ${status}`, cx - base * 0.62, cy - base * 0.71, fs, 0.45);
        drawText(alert ? 'THREAT: DEFENSE' : 'THREAT: NONE', cx + base * 0.62, cy - base * 0.78, fs, 0.5);
        drawText(alert ? 'PROTOCOL: CRIMSON' : 'INTEGRITY: HOLD', cx + base * 0.62, cy - base * 0.71, fs, 0.45);
        drawText(listening || speaking ? 'AUDIO LIVE' : 'ARC AMBIENT — NOT VEHICLE DATA', cx, cy + base * 0.88, fs, 0.4);
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, [listening, thinking, speaking, alert, compact, status]);

  const body = <canvas ref={canvasRef} />;
  if (onActivate) {
    return (
      <button
        type="button"
        className={`ai-core ai-core--hit${compact ? ' ai-core--compact' : ''}`}
        onClick={onActivate}
        aria-label="Talk to JARVIS"
        data-testid="talk-core"
      >
        {body}
      </button>
    );
  }
  return (
    <div className={`ai-core${compact ? ' ai-core--compact' : ''}`} aria-hidden="true">
      {body}
    </div>
  );
}
