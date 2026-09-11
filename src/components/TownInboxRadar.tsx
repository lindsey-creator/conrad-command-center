import { useCallback, useMemo } from 'react';
import { brain, type InboxRadarItem } from '../api/brain';
import { POLL_MODULE_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel, itemTime } from '../utils/renderItems';
import { ConnectSource } from './ConnectSource';
import './town-inbox-radar.css';

interface TownInboxRadarProps {
  brainOnline?: boolean;
  gmailConnected?: boolean;
  onConnect?: (source: string) => void;
}

function itemsForSource(items: InboxRadarItem[], source: string): InboxRadarItem[] {
  return items.filter((item) => (item.source ?? '').toLowerCase() === source);
}

function RadarRow({ item }: { item: InboxRadarItem }) {
  const time = itemTime(item) ?? item.time ?? null;
  const label = item.title ?? itemLabel(item);
  const detail = item.detail;

  return (
    <div className="town-inbox__row">
      {time ? (
        <span className="town-inbox__row-time">{time}</span>
      ) : (
        <span className="town-inbox__row-dot" aria-hidden="true" />
      )}
      <div className="town-inbox__row-body">
        {item.url ? (
          <a
            className="town-inbox__row-link"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        ) : (
          <span className="town-inbox__row-title">{label}</span>
        )}
        {detail && <span className="town-inbox__row-detail">{detail}</span>}
      </div>
    </div>
  );
}

export function TownInboxRadar({
  brainOnline = false,
  gmailConnected = false,
  onConnect,
}: TownInboxRadarProps) {
  const fetchRadar = useCallback(() => brain.inboxRadar(), []);
  const radar = useBrainQuery('town-inbox-radar', fetchRadar, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS,
  });

  const loading = radar.loading && !radar.data;
  const payload = radar.data;
  const brainLive = !!payload && hasLiveData(payload);
  const allItems = (payload?.items ?? []) as InboxRadarItem[];

  const townItems = useMemo(() => itemsForSource(allItems, 'town'), [allItems]);
  const gmailItems = useMemo(
    () =>
      allItems.filter((item) => {
        const s = (item.source ?? '').toLowerCase();
        return s === 'gmail' || s === 'google_gmail' || s === '';
      }),
    [allItems],
  );

  const townHasSignal =
    townItems.length > 0 || (payload?.town_open != null && payload.town_open > 0);
  const townLive = brainOnline && brainLive && townHasSignal;

  const gmailHasSignal =
    gmailItems.length > 0 ||
    (payload?.gmail_unread != null && payload.gmail_unread > 0);
  const gmailReady = brainOnline && brainLive && gmailConnected;
  const gmailLive = gmailReady && gmailHasSignal;

  const townCount =
    payload?.town_open != null ? payload.town_open : townLive ? townItems.length : null;
  const gmailUnread =
    payload?.gmail_unread != null
      ? payload.gmail_unread
      : gmailReady
        ? gmailItems.length
        : null;

  const offlineSources = payload?.sources?.length ? payload.sources : ['gmail', 'town'];

  return (
    <section
      className="town-inbox hud-corners jarvis-glass"
      aria-label="Town radar and Gmail inbox"
    >
      <div className="town-inbox__mesh" aria-hidden="true" />
      <header className="town-inbox__head">
        <div>
          <span className="town-inbox__kicker">JARVIS · external radar</span>
          <h2 className="town-inbox__title">Town &amp; inbox</h2>
          <p className="town-inbox__subtitle">
            town.com signals and Gmail — surfaced for Lindsey in Cursor JARVIS. Live data only.
          </p>
        </div>
        <span
          className={`town-inbox__pill${gmailLive || townLive ? ' town-inbox__pill--live' : ''}`}
        >
          {gmailLive || townLive ? 'LIVE' : 'CONNECT'}
        </span>
      </header>

      <div className="town-inbox__grid">
        <article className="town-inbox__panel town-inbox__panel--town">
          <div className="town-inbox__panel-head">
            <h3 className="town-inbox__panel-title">Town radar</h3>
            <span className="town-inbox__panel-meta">
              {loading ? '…' : townCount != null ? `${townCount} open` : '—'}
            </span>
          </div>
          {loading && <p className="town-inbox__hint">Scanning Brain…</p>}
          {!loading && !brainOnline && (
            <p className="town-inbox__hint">Brain offline — link Stack first.</p>
          )}
          {!loading && brainOnline && townLive && (
            <div className="town-inbox__list">
              {townItems.slice(0, 6).map((item, i) => (
                <RadarRow key={`town-${i}`} item={item} />
              ))}
            </div>
          )}
          {!loading && brainOnline && brainLive && !townHasSignal && (
            <p className="town-inbox__hint">Town radar clear — no open threads from Brain.</p>
          )}
          {!loading && brainOnline && !brainLive && (
            <>
              <p className="town-inbox__hint">
                Wire Town.com on the Brain — JARVIS in Cursor can route threads here when live.
              </p>
              <ConnectSource sources={['town']} onConnect={onConnect} />
            </>
          )}
        </article>

        <article className="town-inbox__panel town-inbox__panel--gmail">
          <div className="town-inbox__panel-head">
            <h3 className="town-inbox__panel-title">Gmail inbox</h3>
            <span className="town-inbox__panel-meta">
              {loading ? '…' : gmailUnread != null ? `${gmailUnread} unread` : '—'}
            </span>
          </div>
          {loading && <p className="town-inbox__hint">Scanning Brain…</p>}
          {!loading && !brainOnline && (
            <p className="town-inbox__hint">Brain offline — link Stack first.</p>
          )}
          {!loading && brainOnline && gmailLive && (
            <div className="town-inbox__list">
              {gmailItems.slice(0, 8).map((item, i) => (
                <RadarRow key={`gmail-${i}`} item={item} />
              ))}
            </div>
          )}
          {!loading && brainOnline && gmailReady && !gmailHasSignal && (
            <p className="town-inbox__hint">Inbox clear — 0 unread in Brain snapshot.</p>
          )}
          {!loading && brainOnline && !gmailConnected && (
            <>
              <p className="town-inbox__hint">
                Connect Google OAuth (Gmail read) — HUD stays empty until his inbox is wired.
              </p>
              <ConnectSource sources={['gmail']} onConnect={onConnect} />
            </>
          )}
          {!loading && brainOnline && gmailConnected && !brainLive && (
            <>
              <p className="town-inbox__hint">
                Gmail is linked — waiting on Brain <code>/inbox/radar</code> for live threads.
              </p>
              <ConnectSource sources={offlineSources} onConnect={onConnect} />
            </>
          )}
        </article>
      </div>

      {payload?.note && brainLive && (
        <p className="town-inbox__footnote">{payload.note}</p>
      )}
    </section>
  );
}
