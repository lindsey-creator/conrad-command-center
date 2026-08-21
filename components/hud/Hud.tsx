'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { blockRangeOnDate, clevelandClock, type ClockParts } from '@/lib/cleveland';
import type { CalendarBlock, CommandFeed } from '@/lib/feed';
import {
  CornerPies,
  DegreeStrip,
  DropLines,
  JarviRings,
  MarkRadar,
  Reticle,
} from './JarviRings';
import './hud.css';

type WhoopStatus = {
  configured: boolean;
  connected: boolean;
  source: 'live' | 'sample' | 'empty';
  empty: boolean;
  recovery: number | null;
  strain: number | null;
  sleep: number | null;
};

function formatRange(startHm: string, endHm: string) {
  return `${formatHm(startHm)}–${formatHm(endHm)}`;
}

function formatHm(hm: string) {
  const [h, m] = hm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

function pickNext(blocks: CalendarBlock[], date: string, now: Date): CalendarBlock | null {
  const upcoming = blocks.filter((block) => {
    const { start } = blockRangeOnDate(date, block.start, block.end);
    return start.getTime() > now.getTime();
  });
  return upcoming[0] ?? null;
}

function Rail({ side }: { side: 'left' | 'right' }) {
  const ticks = Array.from({ length: 32 }, (_, i) => i);
  return (
    <div className={`hud__rail hud__rail--${side}`} aria-hidden="true">
      <svg className="hud__ticks" viewBox="0 0 28 400" preserveAspectRatio="none">
        {ticks.map((i) => (
          <line
            key={i}
            x1={side === 'left' ? 20 : 2}
            y1={8 + i * 12.2}
            x2={side === 'left' ? (i % 4 === 0 ? 3 : 11) : i % 4 === 0 ? 25 : 17}
            y2={8 + i * 12.2}
            stroke={i % 4 === 0 ? 'rgba(0,229,255,0.55)' : 'rgba(0,229,255,0.2)'}
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}

function Widget({
  area,
  label,
  mark,
  markTone,
  tone,
  children,
}: {
  area: string;
  label: string;
  mark?: string;
  markTone?: 'live' | 'amber';
  tone?: 'cyan' | 'alert';
  children: ReactNode;
}) {
  return (
    <section className={`widget widget--${area}`} aria-label={label}>
      <CornerPies tone={tone} />
      <DegreeStrip />
      <DropLines />
      <div className="widget__kicker">
        <span>{label}</span>
        {mark ? <span className={`mark mark--${markTone ?? 'live'}`}>{mark}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function Hud({
  feed,
  initialClock,
}: {
  feed: CommandFeed;
  initialClock: ClockParts;
}) {
  const [now, setNow] = useState(() => new Date());
  const [clock, setClock] = useState(initialClock);
  const [whoop, setWhoop] = useState<WhoopStatus | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      const d = new Date();
      setNow(d);
      setClock(clevelandClock(d));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch('/api/whoop/status', { cache: 'no-store' });
        const data = (await res.json()) as WhoopStatus;
        if (alive) setWhoop(data);
      } catch {
        if (alive) {
          setWhoop({
            configured: false,
            connected: false,
            source: 'empty',
            empty: true,
            recovery: null,
            strain: null,
            sleep: null,
          });
        }
      }
    };
    void load();
    const id = window.setInterval(() => void load(), 90_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const next = useMemo(
    () => pickNext(feed.calendar.blocks, feed.calendar.date, now),
    [feed.calendar.blocks, feed.calendar.date, now],
  );
  const today = feed.calendar.blocks.slice(0, 3);
  const inbound = feed.inbound.cards.slice(0, 3);
  const inboundLive = inbound.some((card) => card.title);
  const liveWhoop = whoop?.source === 'live';
  const recovery = liveWhoop ? whoop.recovery : null;
  const strain = liveWhoop ? whoop.strain : null;
  const sleep = liveWhoop ? whoop.sleep : null;
  const connectHref = whoop?.configured ? '/api/whoop/authorize' : undefined;

  return (
    <main className="hud">
      <div className="hud__void" aria-hidden="true" />
      <div className="hud__hex" aria-hidden="true" />
      <div className="hud__scan" aria-hidden="true" />
      <div className="hud__vignette" aria-hidden="true" />
      <Rail side="left" />
      <Rail side="right" />

      <header className="brand" aria-label="JARVIS">
        <div className="brand__word">J.A.R.V.I.S.</div>
      </header>

      <Widget area="clock" label="CLOCK" mark="AMERICA/NEW_YORK">
        <div className="clock__stage">
          <div className="clock__core">
            <JarviRings idPrefix="clock" />
          </div>
          <div className="clock__readout">
            <div className="clock__time">{clock.time}</div>
            <div className="clock__meta">
              {clock.weekday} {clock.month} {clock.day}
            </div>
          </div>
        </div>
      </Widget>

      <Widget area="status" label="STATUS" mark="COS" markTone="amber">
        <p className="status__line">{feed.status.watching}</p>
      </Widget>

      <Widget area="next" label="NEXT" mark="LIVE">
        <div className="next__stage">
          <div className="next__radar">
            <MarkRadar idPrefix="next" alert={!next} />
          </div>
          {next ? (
            <div className="next__readout">
              <div className="next__time">{formatRange(next.start, next.end)}</div>
              <div className="next__title">{next.title}</div>
              {next.href ? (
                <a className="tap tap--meet" href={next.href} target="_blank" rel="noreferrer">
                  {next.href.includes('zoom.us') ? 'ZOOM' : 'MEET'}
                </a>
              ) : (
                <div className="next__where">
                  {[next.where, next.who].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          ) : (
            <div className="next__readout">
              <div className="next__time next__time--clear">CLEAR</div>
              <div className="next__title">No remaining block</div>
            </div>
          )}
        </div>
      </Widget>

      <Widget area="today" label="TODAY" mark="LIVE">
        <ol className="today__list">
          {today.map((block) => (
            <li key={`${block.start}-${block.title}`}>
              <span className="today__time">{formatRange(block.start, block.end)}</span>
              <span>
                <span className="today__title">{block.title}</span>
                {block.where ? <span className="today__where">{block.where}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </Widget>

      <Widget area="whoop" label="WHOOP" mark={liveWhoop ? 'LIVE' : 'CONNECT'} markTone={liveWhoop ? 'live' : 'amber'}>
        <div className="whoop__body">
          {liveWhoop && recovery != null ? (
            <svg className="whoop-ring" viewBox="0 0 140 140" aria-hidden="true">
              <circle className="whoop-ring__track" cx="70" cy="70" r="54" />
              <circle
                className={`whoop-ring__value whoop-ring__value--${
                  recovery >= 67 ? 'green' : recovery >= 34 ? 'yellow' : 'red'
                }`}
                cx="70"
                cy="70"
                r="54"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - recovery / 100)}
              />
              <text className="whoop-ring__score" x="70" y="74">
                {Math.round(recovery)}
              </text>
            </svg>
          ) : (
            <div className="whoop__core">
              <JarviRings idPrefix="whoop" compact wordmark />
            </div>
          )}
          <div className="whoop__stats">
            <div>
              <div className="whoop__n">{strain == null ? '—' : strain.toFixed(1)}</div>
              <div className="whoop__l">STRAIN</div>
            </div>
            <div>
              <div className="whoop__n">{sleep == null ? '—' : `${Math.round(sleep)}%`}</div>
              <div className="whoop__l">SLEEP</div>
            </div>
          </div>
        </div>
        {whoop?.connected ? null : connectHref ? (
          <a className="tap tap--whoop" href={connectHref}>
            CONNECT WHOOP
          </a>
        ) : (
          <div className="tap tap--dead">CONNECT WHOOP</div>
        )}
      </Widget>

      <Widget
        area="inbound"
        label="INBOUND ONLY"
        mark={inboundLive ? 'LIVE' : 'EMPTY'}
        tone={inboundLive ? 'alert' : 'cyan'}
      >
        <div className="inbound__cards">
          {inbound.map((card) => (
            <article
              key={card.gate}
              className={`inbound__card${card.title ? '' : ' inbound__card--empty'}`}
            >
              <div className="inbound__well" aria-hidden="true">
                <MarkRadar idPrefix={`in-${card.gate}`} alert={Boolean(card.title)} />
                {card.title ? <Reticle className="inbound__reticle" /> : null}
              </div>
              <div className="inbound__copy">
                <div className="inbound__gate">{card.label}</div>
                {card.title ? (
                  <>
                    <div className="inbound__title">{card.title}</div>
                    {card.detail ? <div className="inbound__detail">{card.detail}</div> : null}
                  </>
                ) : (
                  <div className="inbound__detail">—</div>
                )}
              </div>
            </article>
          ))}
        </div>
      </Widget>

      <Widget area="lock" label="LOCK">
        <a className="tap tap--call" href={feed.lock.phone.tel}>
          {feed.lock.phone.number}
        </a>
        <div className="lock__apply">
          {feed.lock.apply.map((link) => (
            <a key={link.href} className="tap tap--apply" href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </Widget>
    </main>
  );
}
