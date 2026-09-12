import { useCallback, useMemo } from 'react';
import { brain, type InboxRadarItem } from '../api/brain';
import { POLL_MODULE_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel, itemTime } from '../utils/renderItems';
import { ConnectSource } from './ConnectSource';
import './live-feeds.css';

export type FeedId = 'town' | 'ghl' | 'calendar' | 'whoop' | 'rise' | 'lo_hunt';

interface FeedCard {
  id: FeedId;
  kicker: string;
  title: string;
  meta: string;
  status: 'live' | 'connect_source' | 'clear' | 'offline';
  sources: string[];
  lines: Array<{ label: string; time?: string | null }>;
  hint: string;
}

interface LiveFeedsProps {
  brainOnline?: boolean;
  gmailConnected?: boolean;
  ghlConnected?: boolean;
  whoopConnected?: boolean;
  calendarConnected?: boolean;
  clickupConnected?: boolean;
  onConnect?: (source: string) => void;
}

function keywordHits(items: unknown[], keywords: string[]): unknown[] {
  return items.filter((item) => {
    const text = itemLabel(item).toLowerCase();
    return keywords.some((k) => text.includes(k));
  });
}

function linesFromItems(items: unknown[], limit = 4): FeedCard['lines'] {
  return items.slice(0, limit).map((item) => ({
    label: itemLabel(item),
    time: itemTime(item),
  }));
}

export function LiveFeeds({
  brainOnline = false,
  gmailConnected = false,
  ghlConnected = false,
  whoopConnected = false,
  calendarConnected = false,
  clickupConnected = false,
  onConnect,
}: LiveFeedsProps) {
  const radar = useBrainQuery('feeds-radar', useCallback(() => brain.inboxRadar(), []), {
    refreshMs: POLL_MODULE_MS,
    staggerMs: 0,
  });
  const ghl = useBrainQuery('feeds-ghl', useCallback(() => brain.ghlCrm(), []), {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS,
  });
  const brief = useBrainQuery('feeds-brief', useCallback(() => brain.dailyBrief(), []), {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 2,
  });
  const whoop = useBrainQuery('feeds-whoop', useCallback(() => brain.healthMetrics(), []), {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 3,
  });
  const watch = useBrainQuery('feeds-watch', useCallback(() => brain.watchlist(), []), {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 4,
  });

  const cards = useMemo<FeedCard[]>(() => {
    const radarItems = (radar.data?.items ?? []) as InboxRadarItem[];
    const townItems = radarItems.filter((item) => (item.source ?? '').toLowerCase() === 'town');
    const radarLive = !!(radar.data && hasLiveData(radar.data));
    const townLive = brainOnline && radarLive && townItems.length > 0;

    const ghlLive = brainOnline && !!(ghl.data && hasLiveData(ghl.data));
    const ghlLeads = ghl.data?.leads ?? [];
    const ghlLines = ghlLive
      ? ghlLeads.length
        ? linesFromItems(ghlLeads)
        : [
            {
              label: `New ${ghl.data?.new_leads ?? 0} · missed ${ghl.data?.missed_calls ?? 0} · unread ${ghl.data?.unread_texts ?? 0}`,
            },
          ]
      : [];

    const schedule = brief.data?.today_schedule;
    const calItems = schedule?.items ?? [];
    const calLive = brainOnline && !!(schedule && hasLiveData(schedule) && calItems.length);

    const whoopMetrics = whoop.data?.metrics?.whoop;
    const whoopLive = brainOnline && !!(whoop.data && hasLiveData(whoop.data) && whoopMetrics);

    const watchItems = watch.data?.items ?? [];
    const watchLive = brainOnline && !!(watch.data && hasLiveData(watch.data));
    const riseHits = keywordHits(watchItems, ['rise', 'qm', 'conventional']);
    const loHits = keywordHits(watchItems, ['non-qm', 'nonqm', 'lo hunt', 'originator', 'loan officer']);

    const town: FeedCard = {
      id: 'town',
      kicker: 'RADAR',
      title: 'Town mail',
      meta: townLive ? `${townItems.length} open` : '—',
      status: !brainOnline
        ? 'offline'
        : townLive
          ? 'live'
          : radarLive
            ? 'clear'
            : 'connect_source',
      sources: radar.data?.sources ?? ['town', 'gmail'],
      lines: townLive ? linesFromItems(townItems) : [],
      hint: gmailConnected
        ? 'Town radar clear — Brain has no town.com threads yet.'
        : 'Town.com + Gmail feed this lane. HUD stays honest until wired.',
    };

    const apply: FeedCard = {
      id: 'ghl',
      kicker: 'APPLY',
      title: 'GHL apply fills',
      meta: ghlLive
        ? `${ghl.data?.new_leads ?? ghlLeads.length} new`
        : '—',
      status: !brainOnline ? 'offline' : ghlLive ? (ghlLeads.length || ghl.data?.new_leads ? 'live' : 'clear') : 'connect_source',
      sources: ghl.data?.sources ?? ['ghl'],
      lines: ghlLines,
      hint: ghlConnected
        ? 'Personal GHL linked — waiting on apply events.'
        : 'Personal GHL location 3nUeqi — never Team FFdZ writes.',
    };

    const calendar: FeedCard = {
      id: 'calendar',
      kicker: 'NEXT',
      title: 'Calendar next',
      meta: calLive ? `${calItems.length} today` : '—',
      status: !brainOnline
        ? 'offline'
        : calLive
          ? 'live'
          : calendarConnected && schedule && hasLiveData(schedule)
            ? 'clear'
            : 'connect_source',
      sources: schedule?.sources ?? ['google_calendar'],
      lines: calLive ? linesFromItems(calItems) : [],
      hint: calendarConnected ? 'Schedule clear for the rest of today.' : 'Google Calendar OAuth fills this lane.',
    };

    const whoopCard: FeedCard = {
      id: 'whoop',
      kicker: 'BODY',
      title: 'WHOOP recovery',
      meta: whoopLive ? String(whoopMetrics?.recovery_score ?? '—') : '—',
      status: !brainOnline ? 'offline' : whoopLive ? 'live' : 'connect_source',
      sources: whoop.data?.sources ?? ['whoop'],
      lines: whoopLive
        ? [
            { label: `Recovery ${String(whoopMetrics?.recovery_score ?? '—')}` },
            { label: `HRV ${String(whoopMetrics?.hrv ?? '—')} · strain ${String(whoopMetrics?.strain ?? '—')}` },
          ]
        : [],
      hint: whoopConnected
        ? 'WHOOP linked — waiting on a recovery snapshot. Display only, not medical advice.'
        : 'Connect WHOOP — recovery is display-only, never medical advice.',
    };

    const rise: FeedCard = {
      id: 'rise',
      kicker: 'QM',
      title: 'Rise QM board',
      meta: watchLive && riseHits.length ? `${riseHits.length} flags` : '—',
      status: !brainOnline
        ? 'offline'
        : watchLive && riseHits.length
          ? 'live'
          : clickupConnected && watchLive
            ? 'clear'
            : 'connect_source',
      sources: watch.data?.sources ?? ['clickup'],
      lines: watchLive && riseHits.length ? linesFromItems(riseHits) : [],
      hint: clickupConnected
        ? 'No Rise / QM keywords on the watch list yet — Brain can fill this slot.'
        : 'ClickUp board status for Rise QM — structured slot, live when tagged.',
    };

    const loHunt: FeedCard = {
      id: 'lo_hunt',
      kicker: 'NON-QM',
      title: 'LO hunt status',
      meta: watchLive && loHits.length ? `${loHits.length} flags` : '—',
      status: !brainOnline
        ? 'offline'
        : watchLive && loHits.length
          ? 'live'
          : clickupConnected && watchLive
            ? 'clear'
            : 'connect_source',
      sources: watch.data?.sources ?? ['clickup'],
      lines: watchLive && loHits.length ? linesFromItems(loHits) : [],
      hint: clickupConnected
        ? 'No Non-QM LO hunt items in Brain yet.'
        : 'Non-QM loan officer hunt — Brain fills this from ClickUp / watch list.',
    };

    return [town, apply, calendar, whoopCard, rise, loHunt];
  }, [
    brainOnline,
    radar.data,
    ghl.data,
    brief.data,
    whoop.data,
    watch.data,
    gmailConnected,
    ghlConnected,
    whoopConnected,
    calendarConnected,
    clickupConnected,
  ]);

  return (
    <section className="live-feeds hud-corners jarvis-glass" aria-label="Live feeds">
      <div className="live-feeds__mesh" aria-hidden="true" />
      <header className="live-feeds__head">
        <div>
          <span className="live-feeds__kicker">JARVIS · live feeds</span>
          <h2 className="live-feeds__title">Radar grid</h2>
          <p className="live-feeds__subtitle">
            Town · GHL apply · calendar · WHOOP · Rise QM · Non-QM LO hunt. Structured slots — Brain fills, HUD never fakes.
          </p>
        </div>
      </header>
      <div className="live-feeds__grid">
        {cards.map((card) => (
          <article
            key={card.id}
            className={`live-feeds__card live-feeds__card--${card.id} live-feeds__card--${card.status}`}
          >
            <div className="live-feeds__card-head">
              <span className="live-feeds__card-kicker">{card.kicker}</span>
              <span className={`live-feeds__card-pill live-feeds__card-pill--${card.status}`}>
                {card.status === 'live'
                  ? 'LIVE'
                  : card.status === 'clear'
                    ? 'CLEAR'
                    : card.status === 'offline'
                      ? 'OFF'
                      : 'CONNECT'}
              </span>
            </div>
            <h3 className="live-feeds__card-title">{card.title}</h3>
            <p className="live-feeds__card-meta">{card.meta}</p>
            {card.lines.length > 0 && (
              <ul className="live-feeds__list">
                {card.lines.map((line, i) => (
                  <li key={`${card.id}-${i}`}>
                    {line.time && <span className="live-feeds__time">{line.time}</span>}
                    <span>{line.label}</span>
                  </li>
                ))}
              </ul>
            )}
            {card.lines.length === 0 && (
              <p className="live-feeds__hint">{card.hint}</p>
            )}
            {(card.status === 'connect_source' || card.status === 'offline') && (
              <ConnectSource sources={card.sources} onConnect={onConnect} />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
