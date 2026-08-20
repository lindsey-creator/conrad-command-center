'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  blockRange,
  clevelandClock,
  type ClockParts,
} from '@/lib/cleveland';
import type { CalendarBlock, CommandFeed } from '@/lib/feed';
import './hud.css';

function recoveryZone(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 67) return 'green';
  if (score >= 34) return 'yellow';
  return 'red';
}

type WhoopStatus = {
  configured: boolean;
  connected: boolean;
  source: 'live' | 'sample' | 'empty';
  empty: boolean;
  recovery: number | null;
  strain: number | null;
  sleep: number | null;
};

function nextAndRest(blocks: CalendarBlock[], now: Date) {
  const dated = blocks.map((block) => ({
    block,
    ...blockRange(block.start, block.end, now),
  }));
  const upcoming = dated.filter((row) => row.end.getTime() > now.getTime());
  const next = upcoming[0] ?? null;
  const rest = (next ? upcoming.slice(1) : upcoming).slice(0, 3);
  return { next: next?.block ?? null, rest: rest.map((row) => row.block) };
}

function formatHm(hm: string) {
  const [h, m] = hm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

function RecoveryRing({
  score,
  zone,
  sample,
}: {
  score: number;
  zone: 'green' | 'yellow' | 'red';
  sample: boolean;
}) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(Math.max(score, 0), 100) / 100);
  return (
    <svg className="whoop-ring" viewBox="0 0 140 140" aria-hidden="true">
      <circle className="whoop-ring__track" cx="70" cy="70" r={r} />
      <circle
        className={`whoop-ring__value whoop-ring__value--${zone}`}
        cx="70"
        cy="70"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
      <text className="whoop-ring__score" x="70" y="74">
        {Math.round(score)}
      </text>
      {sample ? (
        <text className="whoop-ring__sample" x="70" y="96">
          SAMPLE
        </text>
      ) : null}
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
    const tick = () => {
      const d = new Date();
      setNow(d);
      setClock(clevelandClock(d));
    };
    const id = window.setInterval(tick, 1000);
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
            source: 'sample',
            empty: false,
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

  const { next, rest } = useMemo(() => nextAndRest(feed.today.blocks, now), [feed.today.blocks, now]);
  const inbound = feed.inbound.cards.slice(0, 3);
  const liveWhoop = whoop?.source === 'live';
  const emptyWhoop = whoop?.source === 'empty';
  const sampleWhoop = !liveWhoop && !emptyWhoop;
  const recovery = liveWhoop && whoop.recovery != null ? whoop.recovery : feed.whoopSample.recovery;
  const strain = liveWhoop ? whoop.strain : sampleWhoop ? feed.whoopSample.strain : null;
  const sleep = liveWhoop ? whoop.sleep : sampleWhoop ? feed.whoopSample.sleep : null;
  const zone = recoveryZone(recovery);
  const connectHref = whoop?.configured ? '/api/whoop/authorize' : undefined;

  return (
    <main className="hud">
      <div className="hud__bg" aria-hidden="true" />

      <section className="pane pane--clock" aria-label="Clock Cleveland">
        <div className="pane__kicker">
          <span>CLOCK</span>
          <span className="mark mark--lock">{feed.meta.city.toUpperCase()}</span>
        </div>
        <div className="clock__time">{clock.time}</div>
        <div className="clock__meta">
          {clock.weekday} {clock.month} {clock.day} · America/New_York
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
          <span className="mark mark--sample">{feed.today.source === 'sample' ? 'SAMPLE' : 'LIVE'}</span>
        </div>
        {next ? (
          <>
            <div className="next__time">{formatHm(next.start)}</div>
            <div className="next__title">{next.title}</div>
          </>
        ) : (
          <div className="next__time next__time--clear">CLEAR</div>
        )}
      </section>

      <section className="pane pane--today" aria-label="Today">
        <div className="pane__kicker">
          <span>TODAY</span>
          <span className="mark mark--sample">SAMPLE</span>
        </div>
        {rest.length === 0 ? (
          <p className="empty">—</p>
        ) : (
          <ol className="today__list">
            {rest.map((block) => (
              <li key={`${block.start}-${block.title}`}>
                <span className="today__time">{formatHm(block.start)}</span>
                <span className="today__title">{block.title}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="pane pane--whoop" aria-label="WHOOP">
        <div className="pane__kicker">
          <span>WHOOP</span>
          <span className={`mark ${liveWhoop ? 'mark--live' : emptyWhoop ? 'mark--amber' : 'mark--sample'}`}>
            {liveWhoop ? 'LIVE' : emptyWhoop ? 'NO DATA' : 'SAMPLE'}
          </span>
        </div>
        {emptyWhoop ? (
          <p className="empty">Membership or sync empty.</p>
        ) : (
          <div className="whoop__body">
            <RecoveryRing score={recovery} zone={zone} sample={sampleWhoop} />
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
        )}
        {whoop?.connected ? null : connectHref ? (
          <a className="tap tap--whoop" href={connectHref}>
            CONNECT WHOOP
          </a>
        ) : (
          <div className="tap tap--dead">CONNECT WHOOP · SET ENV</div>
        )}
      </section>

      <section className="pane pane--inbound" aria-label="Inbound">
        <div className="pane__kicker">
          <span>INBOUND ONLY</span>
          <span className="mark mark--sample">SAMPLE</span>
        </div>
        <div className="gates">
          {feed.inbound.gates.map((gate) => (
            <span key={gate} className="gate">
              {gate}
            </span>
          ))}
        </div>
        {inbound.length === 0 ? (
          <p className="empty">—</p>
        ) : (
          <div className="inbound__cards">
            {inbound.map((card) => (
              <article key={`${card.gate}-${card.title}`} className="inbound__card">
                <span className={`mark ${card.mark === 'EXAMPLE' ? 'mark--amber' : 'mark--sample'}`}>
                  {card.mark}
                </span>
                <div className="inbound__title">{card.title}</div>
                <div className="inbound__detail">{card.detail}</div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="pane pane--lock" aria-label="Lock">
        <div className="pane__kicker">
          <span>LOCK</span>
          <span className="mark mark--lock">LIVE LINES</span>
        </div>
        <a className="tap tap--call" href={feed.lock.phones.lindsey.tel}>
          CALL {feed.lock.phones.lindsey.number}
        </a>
        <div className="lock__apply">
          {feed.lock.apply.map((link) => (
            <a key={link.href} className="tap tap--apply" href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
        <p className="lock__pat">
          {feed.lock.phones.listing.number} · Pat listing · not his call
        </p>
      </section>
    </main>
  );
}
