import { useCallback } from 'react';
import { brain } from '../api/brain';
import { POLL_MODULE_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel, itemTime } from '../utils/renderItems';
import './feed-slots.css';

const APPLY_PHONE = '216-250-9078';

interface FeedSlotsProps {
  brainOnline?: boolean;
  onConnect?: (source: string) => void;
  onCommand?: (text: string) => void;
}

function firstItemLabel(items: unknown[] | undefined): string | null {
  if (!items?.length) return null;
  const label = itemLabel(items[0]);
  const time = itemTime(items[0]);
  return time ? `${time} · ${label}` : label;
}

export function FeedSlots({ brainOnline = false, onConnect, onCommand }: FeedSlotsProps) {
  const fetchGhl = useCallback(() => brain.ghlCrm(), []);
  const fetchCal = useCallback(() => brain.weekAhead(), []);
  const fetchWhoop = useCallback(() => brain.healthMetrics(), []);
  const fetchMoves = useCallback(() => brain.topMoves(3), []);
  const fetchTown = useCallback(() => brain.inboxRadar(), []);

  const ghl = useBrainQuery('feed-ghl', fetchGhl, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: 0,
  });
  const calendar = useBrainQuery('feed-cal', fetchCal, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS,
  });
  const whoop = useBrainQuery('feed-whoop', fetchWhoop, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 2,
  });
  const moves = useBrainQuery('feed-nonqm', fetchMoves, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 3,
  });
  const town = useBrainQuery('feed-town', fetchTown, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 4,
  });

  const ghlLive = brainOnline && hasLiveData(ghl.data);
  const calLive = brainOnline && hasLiveData(calendar.data);
  const whoopLive = brainOnline && hasLiveData(whoop.data) && Boolean(whoop.data?.metrics?.whoop);
  const townLive = brainOnline && hasLiveData(town.data);
  const townItems = ((town.data?.items ?? []) as unknown[]).filter((item) => {
    const source = String((item as { source?: string }).source ?? '').toLowerCase();
    return source === 'town' || source === '';
  });
  const moveLive = brainOnline && hasLiveData(moves.data);

  const whoopMetric = whoop.data?.metrics?.whoop;
  const recovery =
    whoopMetric && typeof whoopMetric === 'object'
      ? (whoopMetric as Record<string, unknown>).recovery ??
        (whoopMetric as Record<string, unknown>).recovery_score
      : null;

  const slots = [
    {
      id: 'town',
      name: 'Town',
      source: 'town',
      live: townLive && (townItems.length > 0 || (town.data?.town_open ?? 0) > 0),
      body: townLive
        ? firstItemLabel(townItems) ??
          (town.data?.town_open != null ? `${town.data.town_open} open in Town` : 'Town linked — no open threads.')
        : 'Town.com radar is not on this Brain yet. Connect the source — no invented pipeline.',
      metric: town.data?.town_open != null && townLive ? String(town.data.town_open) : null,
      command: 'Brief Town.com — what needs me now?',
    },
    {
      id: 'ghl_apply',
      name: 'GHL apply',
      source: 'ghl',
      live: Boolean(ghlLive),
      body: ghlLive
        ? `${ghl.data?.new_leads ?? 0} new · ${ghl.data?.missed_calls ?? 0} missed · ${ghl.data?.unread_texts ?? 0} unread`
        : `Personal apply location only. Publish line ${APPLY_PHONE}. Connect GHL to see live apply flow.`,
      metric: ghlLive ? String(ghl.data?.new_leads ?? 0) : null,
      note: `Apply · ${APPLY_PHONE}`,
      command: 'GHL apply: what leads need a move right now?',
    },
    {
      id: 'calendar',
      name: 'Calendar',
      source: 'google_calendar',
      live: Boolean(calLive),
      body: calLive
        ? firstItemLabel(calendar.data?.items) ?? 'Week is clear on the Brain.'
        : 'Connect Google Calendar — JARVIS defends training, recovery, and family blocks.',
      command: "What's on my calendar and what should I protect?",
    },
    {
      id: 'whoop',
      name: 'WHOOP',
      source: 'whoop',
      live: Boolean(whoopLive),
      body: whoopLive
        ? recovery != null
          ? `Recovery ${String(recovery)} — display only, never medical advice.`
          : 'WHOOP linked. Recovery/HRV when the Brain has a reading.'
        : 'Connect WHOOP for recovery, HRV, and sleep. JARVIS tracks — he does not dose or diagnose.',
      metric: whoopLive && recovery != null ? String(recovery) : null,
      command: 'WHOOP: narrate recovery and whether the day should go hard or easy.',
    },
    {
      id: 'rise',
      name: 'Rise',
      source: 'rise',
      live: false,
      body: 'Rise sleep is not wired on this Brain. Connect the source — no invented sleep score.',
      command: 'Rise: is sleep in the green, and what should I protect tonight?',
    },
    {
      id: 'nonqm',
      name: 'Non-QM',
      source: 'nonqm',
      live: Boolean(moveLive && (moves.data?.moves?.length ?? 0) > 0),
      body: moveLive && moves.data?.moves?.[0]
        ? moves.data.moves[0].title
        : 'Non-QM desk is standby until deals hit the Brain. Numbers come from the engine only.',
      command: 'Non-QM: what file is money now, and what is leaking?',
    },
  ];

  return (
    <section className="feed-slots hud-corners jarvis-glass" aria-label="Feed slots">
      <div className="feed-slots__head">
        <div>
          <span className="feed-slots__kicker">Feed slots</span>
          <h2 className="feed-slots__title">Town · GHL · Calendar · WHOOP · Rise · Non-QM</h2>
        </div>
      </div>
      <ul className="feed-slots__grid">
        {slots.map((slot) => (
          <li key={slot.id} className="feed-slot">
            <div className="feed-slot__top">
              <span className="feed-slot__name">{slot.name}</span>
              <span
                className={`feed-slot__state${slot.live ? ' feed-slot__state--live' : ' feed-slot__state--connect'}`}
              >
                {slot.live ? 'Live' : 'Connect'}
              </span>
            </div>
            {slot.metric && <div className="feed-slot__metric">{slot.metric}</div>}
            <p className="feed-slot__body">{slot.body}</p>
            {slot.note && <span className="feed-slot__note">{slot.note}</span>}
            <div className="feed-slot__actions">
              {!slot.live && onConnect && (
                <button type="button" className="feed-slot__btn" onClick={() => onConnect(slot.source)}>
                  Connect
                </button>
              )}
              {onCommand && (
                <button type="button" className="feed-slot__btn" onClick={() => onCommand(slot.command)}>
                  Ask JARVIS
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
