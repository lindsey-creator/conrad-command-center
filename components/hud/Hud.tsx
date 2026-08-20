'use client';

import { useEffect, useMemo, useState } from 'react';
import { blockRangeOnDate, clevelandClock, type ClockParts } from '@/lib/cleveland';
import type { CalendarBlock, CommandFeed } from '@/lib/feed';
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
    const { end } = blockRangeOnDate(date, block.start, block.end);
    return end.getTime() > now.getTime();
  });
  return upcoming[0] ?? null;
}

function EmptyRing() {
  return (
    <svg className="whoop-ring" viewBox="0 0 140 140" aria-hidden="true">
      <circle className="whoop-ring__track" cx="70" cy="70" r="54" />
      <text className="whoop-ring__score" x="70" y="74">
        —
      </text>
    </svg>
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
      <div className="hud__bg" aria-hidden="true" />

      <section className="pane pane--clock" aria-label="Clock">
        <div className="pane__kicker">
          <span>CLOCK</span>
          <span className="mark mark--lock">AMERICA/NEW_YORK</span>
        </div>
        <div className="clock__time">{clock.time}</div>
        <div className="clock__meta">
          {clock.weekday} {clock.month} {clock.day}
        </div>
      </section>

      <section className="pane pane--status" aria-label="Status">
        <div className="pane__kicker">
          <span>STATUS</span>
          <span className="mark mark--amber">COS</span>
        </div>
        <p className="status__line">{feed.status.watching}</p>
      </section>

      <section className="pane pane--next" aria-label="Next">
        <div className="pane__kicker">
          <span>NEXT</span>
          <span className="mark mark--live">LIVE</span>
        </div>
        {next ? (
          <>
            <div className="next__time">{formatRange(next.start, next.end)}</div>
            <div className="next__title">{next.title}</div>
            {next.href ? (
              <a className="tap tap--meet" href={next.href} target="_blank" rel="noreferrer">
                MEET
              </a>
            ) : (
              <div className="next__where">
                {[next.where, next.who].filter(Boolean).join(' · ')}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="next__time next__time--clear">CLEAR</div>
            <div className="next__title">No remaining block</div>
          </>
        )}
      </section>

      <section className="pane pane--today" aria-label="Today">
        <div className="pane__kicker">
          <span>TODAY</span>
          <span className="mark mark--live">LIVE</span>
        </div>
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
      </section>

      <section className="pane pane--whoop" aria-label="WHOOP">
        <div className="pane__kicker">
          <span>WHOOP</span>
          <span className={`mark ${liveWhoop ? 'mark--live' : 'mark--amber'}`}>
            {liveWhoop ? 'LIVE' : 'CONNECT'}
          </span>
        </div>
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
            <EmptyRing />
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
      </section>

      <section className="pane pane--inbound" aria-label="Inbound">
        <div className="pane__kicker">
          <span>INBOUND ONLY</span>
          <span className={`mark ${inboundLive ? 'mark--live' : 'mark--amber'}`}>
            {inboundLive ? 'LIVE' : 'EMPTY'}
          </span>
        </div>
        <div className="inbound__cards">
          {inbound.map((card) => (
            <article
              key={card.gate}
              className={`inbound__card${card.title ? '' : ' inbound__card--empty'}`}
            >
              <div className="inbound__gate">{card.label}</div>
              {card.title ? (
                <>
                  <div className="inbound__title">{card.title}</div>
                  {card.detail ? <div className="inbound__detail">{card.detail}</div> : null}
                </>
              ) : (
                <div className="inbound__detail">—</div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="pane pane--lock" aria-label="Lock">
        <div className="pane__kicker">
          <span>LOCK</span>
        </div>
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
      </section>
    </main>
  );
}
