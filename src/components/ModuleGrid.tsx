import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { brain, type WatchlistItem } from '../api/brain';
import { useBrainRefreshListener } from '../hooks/brainRefresh';
import { POLL_CONNECTORS_MS, POLL_FAST_MS, POLL_MODULE_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useFlashOnUpdate } from '../hooks/useFlashOnUpdate';
import { useBrainQuery } from '../hooks/useBrainQuery';
import {
  hasLiveData,
  itemLabel,
  itemSeverity,
  itemTime,
  type LaneRowSeverity,
} from '../utils/renderItems';
import { ClickUpTaskActions } from './ClickUpTaskActions';
import { ConnectSource } from './ConnectSource';
import { formatAdsMetric, IssueTaskForm } from './IssueTaskForm';
import { IntelLane } from './IntelLane';
import { LaneModule } from './LaneModule';
import '../styles/intel-lanes.css';

const STATIC_SOURCES = {
  ghl: ['ghl'],
  meta: ['meta'],
  weekAhead: ['google_calendar'],
  weather: ['weather'],
  healthWhoop: ['whoop'],
  healthApple: ['apple_health'],
  calendarProtection: ['google_calendar'],
  wellbeing: ['wellbeing_checkin'],
  issueTask: ['clickup'],
  teamFieldy: ['fieldy', 'clickup'],
  briefFieldy: ['fieldy', 'clickup'],
} as const;

interface ModuleGridProps {
  onConnect?: (source: string) => void;
}

function countItems(data: { items?: unknown[] } | null | undefined): number {
  return data?.items?.length ?? 0;
}

function clickupTaskId(item: unknown): string | null {
  const row = item as WatchlistItem;
  if (row.source !== 'clickup') return null;
  const id = row.clickup_task_id;
  return id ? String(id) : null;
}


function ghlContactUrl(item: unknown): string | null {
  const row = item as { ghl_url?: string; ghl_contact_id?: string };
  if (row.ghl_url) return row.ghl_url;
  return null;
}

function LaneRow({
  item,
  fallbackTime,
  clickupConnected,
  onTaskUpdated,
  onTaskCompleted,
  onTaskCompleteFailed,
  removing,
}: {
  item: unknown;
  fallbackTime?: string;
  clickupConnected?: boolean;
  onTaskUpdated?: () => void;
  onTaskCompleted?: (taskId: string) => void;
  onTaskCompleteFailed?: (taskId: string) => void;
  removing?: boolean;
}) {
  const severity = itemSeverity(item);
  const time = itemTime(item) ?? fallbackTime ?? null;
  const taskId = clickupConnected ? clickupTaskId(item) : null;
  const ghlUrl = ghlContactUrl(item);

  return (
    <div
      className={`lane-row${taskId || ghlUrl ? ' lane-row--with-actions' : ''}${
        removing ? ' lane-row--removing' : ''
      }`}
    >
      {time ? (
        <span className="lane-row__time">{time}</span>
      ) : (
        <span className={`lane-row__dot lane-row__dot--${severity}`} aria-hidden="true" />
      )}
      <span className="lane-row__text">{itemLabel(item)}</span>
      {ghlUrl && (
        <a
          className="ghl-open-btn"
          href={ghlUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in GHL
        </a>
      )}
      {taskId && (
        <ClickUpTaskActions
          taskId={taskId}
          onUpdated={onTaskUpdated}
          onCompleted={onTaskCompleted}
          onCompleteFailed={onTaskCompleteFailed}
          compact
        />
      )}
    </div>
  );
}

function OverdueRow({
  person,
  task,
  daysLate,
  clickupTaskId: taskId,
  clickupConnected,
  onTaskUpdated,
  onTaskCompleted,
  onTaskCompleteFailed,
  removing,
}: {
  person: string;
  task: string;
  daysLate: number;
  clickupTaskId?: string;
  clickupConnected?: boolean;
  onTaskUpdated?: () => void;
  onTaskCompleted?: (taskId: string) => void;
  onTaskCompleteFailed?: (taskId: string) => void;
  removing?: boolean;
}) {
  const severity: LaneRowSeverity = daysLate >= 7 ? 'crit' : 'warn';
  const showActions = clickupConnected && taskId;

  return (
    <div
      className={`lane-row${showActions ? ' lane-row--with-actions' : ''}${
        removing ? ' lane-row--removing' : ''
      }`}
    >
      <span className={`lane-row__dot lane-row__dot--${severity}`} aria-hidden="true" />
      <span className="lane-row__text">
        <strong>{person}</strong>: {task} ({daysLate}d late)
      </span>
      {showActions && taskId && (
        <ClickUpTaskActions
          taskId={taskId}
          onUpdated={onTaskUpdated}
          onCompleted={onTaskCompleted}
          onCompleteFailed={onTaskCompleteFailed}
          compact
        />
      )}
    </div>
  );
}

function GapRow({
  person,
  committed,
  actual,
  suggestedMove,
  clickupTaskId: taskId,
  clickupConnected,
  onTaskUpdated,
  onTaskCompleted,
  onTaskCompleteFailed,
  removing,
}: {
  person: string;
  committed: string;
  actual: string;
  suggestedMove: string;
  clickupTaskId?: string;
  clickupConnected?: boolean;
  onTaskUpdated?: () => void;
  onTaskCompleted?: (taskId: string) => void;
  onTaskCompleteFailed?: (taskId: string) => void;
  removing?: boolean;
}) {
  const showActions = clickupConnected && taskId;

  return (
    <div
      className={`lane-row${showActions ? ' lane-row--with-actions' : ''}${
        removing ? ' lane-row--removing' : ''
      }`}
    >
      <span className="lane-row__dot lane-row__dot--warn" aria-hidden="true" />
      <span className="lane-row__text">
        <strong>{person}</strong>: {committed} → {actual}. {suggestedMove}
      </span>
      {showActions && taskId && (
        <ClickUpTaskActions
          taskId={taskId}
          onUpdated={onTaskUpdated}
          onCompleted={onTaskCompleted}
          onCompleteFailed={onTaskCompleteFailed}
          compact
        />
      )}
    </div>
  );
}

export function ModuleGrid({ onConnect }: ModuleGridProps) {
  const fetchBlindspots = useCallback(() => brain.blindspots(), []);
  const fetchWatchlist = useCallback(() => brain.watchlist(), []);
  const fetchTopMoves = useCallback(() => brain.topMoves(3), []);
  const fetchTeamPulse = useCallback(() => brain.teamPulse(), []);
  const fetchBrief = useCallback(() => brain.dailyBrief(), []);
  const fetchGhl = useCallback(() => brain.ghlCrm(), []);
  const fetchAudio = useCallback(() => brain.audioRecent(12), []);
  const fetchHealth = useCallback(() => brain.healthMetrics(), []);
  const fetchWeek = useCallback(() => brain.weekAhead(), []);
  const fetchMetaAds = useCallback(() => brain.metaAds(), []);
  const fetchWeather = useCallback(() => brain.weather(), []);
  const fetchConnectors = useCallback(() => brain.connectorsStatus(), []);

  const blindspots = useBrainQuery('blindspots', fetchBlindspots, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: 0,
  });
  const watchlist = useBrainQuery('watchlist', fetchWatchlist, {
    refreshMs: POLL_FAST_MS,
    staggerMs: POLL_STAGGER_MS,
  });
  const topMoves = useBrainQuery('top-moves', fetchTopMoves, {
    refreshMs: POLL_FAST_MS,
    staggerMs: POLL_STAGGER_MS * 2,
  });
  const teamPulse = useBrainQuery('team-pulse', fetchTeamPulse, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 3,
  });
  const dailyBrief = useBrainQuery('daily-brief', fetchBrief, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 4,
  });
  const ghlCrm = useBrainQuery('ghl-crm', fetchGhl, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 5,
  });
  const audioRecent = useBrainQuery('audio-recent', fetchAudio, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 5 + 200,
  });
  const healthMetrics = useBrainQuery('health-metrics', fetchHealth, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 6,
  });
  const weekAhead = useBrainQuery('week-ahead', fetchWeek, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 7,
  });
  const metaAds = useBrainQuery('meta-ads', fetchMetaAds, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 7 + 100,
  });
  const weather = useBrainQuery('weather', fetchWeather, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 7 + 200,
  });
  const connectors = useBrainQuery('scan-connectors', fetchConnectors, {
    refreshMs: POLL_CONNECTORS_MS,
    staggerMs: POLL_STAGGER_MS * 8,
  });

  const ghlLive = ghlCrm.data && hasLiveData(ghlCrm.data);
  const metaLive = metaAds.data && hasLiveData(metaAds.data);
  const weatherLive = weather.data && hasLiveData(weather.data);
  const ghlLeads = ghlLive ? (ghlCrm.data?.new_leads ?? 0) : null;
  const ghlUnread = ghlLive ? (ghlCrm.data?.unread_texts ?? 0) : null;

  const briefTodayCount =
    countItems(dailyBrief.data?.today) + countItems(dailyBrief.data?.today_schedule);

  const connected = connectors.data?.connected_count ?? 0;
  const total = connectors.data?.total ?? 9;
  const clickupConnected = connectors.data?.connectors?.clickup?.connected ?? false;

  const [removedTaskIds, setRemovedTaskIds] = useState<Set<string>>(() => new Set());
  const [removingTaskIds, setRemovingTaskIds] = useState<Set<string>>(() => new Set());
  const removeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    return () => {
      for (const timer of removeTimers.current.values()) clearTimeout(timer);
    };
  }, []);

  const refreshClickUpLanes = useCallback(() => {
    watchlist.refresh();
    teamPulse.refresh();
    dailyBrief.refresh();
  }, [watchlist, teamPulse, dailyBrief]);

  const handleTaskCompleted = useCallback(
    (taskId: string) => {
      setRemovingTaskIds((prev) => new Set(prev).add(taskId));
      const existing = removeTimers.current.get(taskId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        setRemovedTaskIds((prev) => new Set(prev).add(taskId));
        setRemovingTaskIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
        removeTimers.current.delete(taskId);
      }, 280);
      removeTimers.current.set(taskId, timer);
      refreshClickUpLanes();
    },
    [refreshClickUpLanes],
  );

  const handleTaskCompleteFailed = useCallback((taskId: string) => {
    const existing = removeTimers.current.get(taskId);
    if (existing) {
      clearTimeout(existing);
      removeTimers.current.delete(taskId);
    }
    setRemovingTaskIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
    setRemovedTaskIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  }, []);

  const isTaskVisible = useCallback(
    (taskId?: string) => !taskId || !removedTaskIds.has(taskId),
    [removedTaskIds],
  );

  const isTaskRemoving = useCallback(
    (taskId?: string) => !!taskId && removingTaskIds.has(taskId),
    [removingTaskIds],
  );

  const visibleWatchItems = useMemo(
    () =>
      (watchlist.data?.items ?? []).filter((item) => {
        const id = clickupConnected ? clickupTaskId(item) : null;
        return isTaskVisible(id ?? undefined);
      }),
    [watchlist.data, clickupConnected, isTaskVisible],
  );

  const visibleOverdue = useMemo(
    () =>
      (teamPulse.data?.overdue ?? []).filter((o) =>
        isTaskVisible(o.clickup_task_id),
      ),
    [teamPulse.data, isTaskVisible],
  );

  const visibleGaps = useMemo(
    () =>
      (teamPulse.data?.gaps ?? []).filter((g) =>
        isTaskVisible(g.clickup_task_id),
      ),
    [teamPulse.data, isTaskVisible],
  );

  const watchCount = visibleWatchItems.length;
  const overdueCount = visibleOverdue.length;
  const watchTotal = watchCount + overdueCount;

  const refreshAllLanes = useCallback(() => {
    blindspots.refresh();
    watchlist.refresh();
    topMoves.refresh();
    teamPulse.refresh();
    dailyBrief.refresh();
    ghlCrm.refresh();
    audioRecent.refresh();
    healthMetrics.refresh();
    weekAhead.refresh();
    metaAds.refresh();
    weather.refresh();
    connectors.refresh();
  }, [
    blindspots,
    watchlist,
    topMoves,
    teamPulse,
    dailyBrief,
    ghlCrm,
    audioRecent,
    healthMetrics,
    weekAhead,
    metaAds,
    weather,
    connectors,
  ]);

  useBrainRefreshListener(refreshAllLanes);

  const topMoveDollars = topMoves.data?.moves?.[0]?.dollars ?? '—';

  const revenueBadge = ghlLive ? (ghlLeads ?? 0) + (topMoves.data?.moves?.length ?? 0) : null;
  const scheduleCount = countItems(dailyBrief.data?.today_schedule);

  const flashGhl = useFlashOnUpdate(ghlCrm.lastFetched?.getTime());
  const flashBrief = useFlashOnUpdate(dailyBrief.lastFetched?.getTime());
  const flashWatch = useFlashOnUpdate(watchlist.lastFetched?.getTime() ?? teamPulse.lastFetched?.getTime());
  const flashStack = useFlashOnUpdate(connectors.lastFetched?.getTime());

  return (
    <>
      <div className="priority-horns-kicker">JARVIS · LIVE SIGNALS</div>
      <div className="priority-scan" role="group" aria-label="Live signals">
        <div className={`scan-tile scan-tile--fire${flashGhl ? ' scan-tile--flash' : ''}`}>
          <span
            className={`scan-tile__dot scan-tile__dot--fire${ghlLive ? ' scan-tile__dot--live' : ''}`}
          />
          <div className="scan-tile__kicker">Meta→GHL</div>
          <div className="scan-tile__val scan-tile__val--money">
            {ghlCrm.loading && !ghlCrm.data
              ? '…'
              : ghlLeads !== null
                ? ghlLeads
                : '—'}
          </div>
          <div className="scan-tile__lbl">
            {ghlLive
              ? `Leads · ${ghlUnread ?? 0} unread SMS`
              : 'Connect GHL — A2P + speed-to-lead'}
          </div>
        </div>
        <div className={`scan-tile${flashBrief ? ' scan-tile--flash' : ''}`}>
          <span className="scan-tile__dot" />
          <div className="scan-tile__kicker">Today</div>
          <div className="scan-tile__val">
            {dailyBrief.loading && !dailyBrief.data ? '…' : briefTodayCount || '—'}
          </div>
          <div className="scan-tile__lbl">Brief · schedule · voice</div>
        </div>
        <div className={`scan-tile${flashWatch ? ' scan-tile--flash' : ''}`}>
          <span
            className={`scan-tile__dot${watchTotal > 0 ? ' scan-tile__dot--warn' : ''}`}
          />
          <div className="scan-tile__kicker">Watch</div>
          <div
            className={`scan-tile__val${watchTotal > 0 ? ' scan-tile__val--warn' : ''}`}
          >
            {watchlist.loading && !watchlist.data && !teamPulse.data
              ? '…'
              : watchTotal || '—'}
          </div>
          <div className="scan-tile__lbl">
            {overdueCount > 0
              ? `${overdueCount} overdue · ${watchCount} alerts`
              : 'Overdue · tasks · alerts'}
          </div>
        </div>
        <div className={`scan-tile${flashStack ? ' scan-tile--flash' : ''}`}>
          <span
            className={`scan-tile__dot${connected > 0 ? ' scan-tile__dot--live' : ''}`}
          />
          <div className="scan-tile__kicker">Stack</div>
          <div
            className={`scan-tile__val${connected === total && connected > 0 ? ' scan-tile__val--live' : ''}`}
          >
            {connectors.loading && !connectors.data ? '…' : `${connected}/${total}`}
          </div>
          <div className="scan-tile__lbl">
            {connected === total && connected > 0 ? 'All connectors live' : 'Sources linked'}
          </div>
        </div>
      </div>

      <div className="intel-lanes intel-lanes--quad">
        <IntelLane
          variant="crm"
          title="Revenue"
          subtitle="GHL · Pipeline · Meta"
          badge={revenueBadge}
          badgeVariant={ghlLive ? 'live' : undefined}
        >
            <LaneModule
              title="GoHighLevel CRM"
              icon="📞"
              pill={ghlCrm.data && hasLiveData(ghlCrm.data) ? 'Live' : 'CRM'}
              pillVariant={ghlCrm.data && hasLiveData(ghlCrm.data) ? 'go' : 'default'}
              loading={ghlCrm.loading && !ghlCrm.data}
            >
              <div className="metrics">
                <div className="metric">
                  <div className="n">
                    {ghlCrm.data && hasLiveData(ghlCrm.data)
                      ? ghlCrm.data.new_leads ?? '—'
                      : '—'}
                  </div>
                  <div className="l">New Leads</div>
                </div>
                <div className="metric">
                  <div className="n">
                    {ghlCrm.data && hasLiveData(ghlCrm.data)
                      ? ghlCrm.data.missed_calls ?? '—'
                      : '—'}
                  </div>
                  <div className="l">Missed Calls</div>
                </div>
                <div className="metric">
                  <div className="n">
                    {ghlCrm.data && hasLiveData(ghlCrm.data)
                      ? ghlCrm.data.unread_texts ?? '—'
                      : '—'}
                  </div>
                  <div className="l">Unread Texts</div>
                </div>
              </div>
              {ghlCrm.data && !hasLiveData(ghlCrm.data) && (
                <ConnectSource sources={[...STATIC_SOURCES.ghl]} onConnect={onConnect} />
              )}
              {ghlCrm.data?.leads && ghlCrm.data.leads.length > 0 && (
                <div className="item-list ghl-leads-list">
                  <div className="brief-kicker">
                    Recent contacts ({ghlCrm.data.leads.length})
                  </div>
                  {ghlCrm.data.leads.map((lead, i) => (
                    <LaneRow key={`lead-${i}`} item={lead} />
                  ))}
                </div>
              )}
            </LaneModule>

            <LaneModule
              title="Money Moves"
              icon="💰"
              pill="Top-3"
              pillVariant="go"
              loading={topMoves.loading && !topMoves.data}
            >
              {topMoves.data && !hasLiveData(topMoves.data) ? (
                <>
                  <p>Active deals + highest-value moves with one-tap approve.</p>
                  <ConnectSource sources={topMoves.data.sources} onConnect={onConnect} />
                </>
              ) : topMoves.data && topMoves.data.moves.length > 0 ? (
                <div className="moves-list">
                  {topMoves.data.moves.map((move, i) => (
                    <div className="move-item" key={i}>
                      <div className="dollars">{move.dollars ?? '—'}</div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{move.title}</div>
                      <div className="why">{move.why}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No money moves surfaced yet{topMoveDollars !== '—' ? '' : '.'}</p>
              )}
            </LaneModule>

            <LaneModule
              title="Meta Ads → GHL"
              icon="📈"
              pill={metaLive ? 'Live' : 'Meta'}
              pillVariant={metaLive ? 'go' : 'warn'}
              defaultOpen={false}
              loading={metaAds.loading && !metaAds.data}
            >
              {metaAds.data && metaLive ? (
                <>
                  <p>
                    Standing #1 fire: Meta investor leads → GHL capture. A2P 10DLC,
                    speed-to-lead, and qualifying form data in SMS alerts.
                  </p>
                  <div className="metrics">
                    <div className="metric">
                      <div className="n">{formatAdsMetric(metaAds.data.daily_spend)}</div>
                      <div className="l">Daily Spend</div>
                    </div>
                    <div className="metric">
                      <div className="n">{formatAdsMetric(metaAds.data.leads)}</div>
                      <div className="l">Leads</div>
                    </div>
                    <div className="metric">
                      <div className="n">{formatAdsMetric(metaAds.data.cost_per_lead)}</div>
                      <div className="l">Cost / Lead</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Standing #1 fire: Meta investor leads → GHL capture. A2P 10DLC, speed-to-lead,
                    and qualifying form data in SMS alerts are not yet connected here.
                  </p>
                  <div className="metrics">
                    <div className="metric">
                      <div className="n">—</div>
                      <div className="l">Daily Spend</div>
                    </div>
                    <div className="metric">
                      <div className="n">—</div>
                      <div className="l">Leads</div>
                    </div>
                    <div className="metric">
                      <div className="n">—</div>
                      <div className="l">Cost / Lead</div>
                    </div>
                  </div>
                  <ConnectSource
                    sources={
                      metaAds.data?.sources?.length
                        ? metaAds.data.sources
                        : [...STATIC_SOURCES.meta]
                    }
                    onConnect={onConnect}
                  />
                </>
              )}
            </LaneModule>
        </IntelLane>

        <IntelLane
          variant="tasks"
          title="Operations"
          subtitle="ClickUp · Pulse · Blindspots"
          badge={watchTotal > 0 ? watchTotal : null}
          badgeVariant={overdueCount > 0 ? 'warn' : undefined}
        >
            <LaneModule
              title="Today's Watch List (CRITICAL)"
              icon="🚨"
              pill={watchTotal > 0 ? `${watchTotal} open` : 'Clear'}
              pillVariant={watchTotal > 0 ? 'warn' : 'go'}
              loading={watchlist.loading && !watchlist.data}
            >
              {watchlist.data && hasLiveData(watchlist.data) ? (
                <div className="item-list">
                  {visibleWatchItems.map((item, i) => {
                    const taskId = clickupConnected ? clickupTaskId(item) : null;
                    return (
                      <LaneRow
                        key={taskId ?? i}
                        item={item}
                        clickupConnected={clickupConnected}
                        onTaskUpdated={refreshClickUpLanes}
                        onTaskCompleted={handleTaskCompleted}
                        onTaskCompleteFailed={handleTaskCompleteFailed}
                        removing={isTaskRemoving(taskId ?? undefined)}
                      />
                    );
                  })}
                </div>
              ) : watchlist.data ? (
                <ConnectSource sources={watchlist.data.sources} onConnect={onConnect} />
              ) : (
                <p>Due-dated priorities and overdue tasks from ClickUp.</p>
              )}
            </LaneModule>

            <LaneModule
              title="Team Pulse"
              icon="👥"
              pill={overdueCount > 0 ? `${overdueCount} overdue` : 'Accountability'}
              pillVariant={overdueCount > 0 ? 'warn' : 'default'}
              loading={teamPulse.loading && !teamPulse.data}
            >
              {teamPulse.data && !hasLiveData(teamPulse.data) ? (
                <>
                  <p>Who said they&apos;d do what — and whether it moved.</p>
                  <ConnectSource sources={teamPulse.data.sources} onConnect={onConnect} />
                </>
              ) : teamPulse.data ? (
                <div className="item-list">
                  {visibleGaps.map((g, i) => (
                    <GapRow
                      key={i}
                      person={g.person}
                      committed={g.committed}
                      actual={g.actual}
                      suggestedMove={g.suggested_move}
                      clickupTaskId={g.clickup_task_id}
                      clickupConnected={clickupConnected}
                      onTaskUpdated={refreshClickUpLanes}
                      onTaskCompleted={handleTaskCompleted}
                      onTaskCompleteFailed={handleTaskCompleteFailed}
                      removing={isTaskRemoving(g.clickup_task_id)}
                    />
                  ))}
                  {visibleOverdue.map((o, i) => (
                    <OverdueRow
                      key={`o-${o.clickup_task_id ?? i}`}
                      person={o.person}
                      task={o.task}
                      daysLate={o.days_late}
                      clickupTaskId={o.clickup_task_id}
                      clickupConnected={clickupConnected}
                      onTaskUpdated={refreshClickUpLanes}
                      onTaskCompleted={handleTaskCompleted}
                      onTaskCompleteFailed={handleTaskCompleteFailed}
                      removing={isTaskRemoving(o.clickup_task_id)}
                    />
                  ))}
                </div>
              ) : null}
            </LaneModule>

            <LaneModule
              title="Blind Spots"
              icon="🔍"
              pill="Scan"
              pillVariant="crit"
              defaultOpen={false}
              loading={blindspots.loading && !blindspots.data}
            >
              {blindspots.data && hasLiveData(blindspots.data) ? (
                <div className="item-list">
                  {(blindspots.data.items ?? []).length > 0 ? (
                    (blindspots.data.items ?? []).map((item, i) => (
                      <LaneRow key={i} item={item} />
                    ))
                  ) : (
                    <p>No blind spots from connected sources.</p>
                  )}
                </div>
              ) : blindspots.data ? (
                <ConnectSource sources={blindspots.data.sources} onConnect={onConnect} />
              ) : (
                <p>What you&apos;re not seeing across the 8 units.</p>
              )}
            </LaneModule>

            <LaneModule title="Issue a Task" icon="📋" pill="Echo Route" defaultOpen={false}>
              <p>Voice or text → routed via Echo to ClickUp with context.</p>
              <IssueTaskForm sources={[...STATIC_SOURCES.issueTask]} onConnect={onConnect} />
            </LaneModule>
        </IntelLane>

        <IntelLane
          variant="audio"
          title="Echo Intel"
          subtitle="Fieldy · Brief · Echo"
          badge={briefTodayCount > 0 ? briefTodayCount : null}
        >
            <LaneModule
              title="Fieldy · ClickUp Transcripts"
              icon="🎙️"
              pill={
                audioRecent.data && hasLiveData(audioRecent.data)
                  ? `${audioRecent.data.items?.length ?? 0} recent`
                  : 'Audio'
              }
              pillVariant={
                audioRecent.data && hasLiveData(audioRecent.data) ? 'go' : 'default'
              }
              loading={audioRecent.loading && !audioRecent.data}
            >
              {audioRecent.data && hasLiveData(audioRecent.data) ? (
                <div className="item-list">
                  {(audioRecent.data.items ?? []).length > 0 ? (
                    (audioRecent.data.items ?? []).map((item, i) => (
                      <LaneRow key={`audio-${i}`} item={item} />
                    ))
                  ) : (
                    <p className="feed-hint">
                      {(audioRecent.data as { note?: string }).note ??
                        'No transcripts in the last 7 days.'}
                    </p>
                  )}
                </div>
              ) : audioRecent.data ? (
                <ConnectSource
                  sources={audioRecent.data.sources?.length ? audioRecent.data.sources : [...STATIC_SOURCES.teamFieldy]}
                  onConnect={onConnect}
                />
              ) : (
                <p>Meeting captures from Fieldy and Echo / ClickUp.</p>
              )}
            </LaneModule>

            <LaneModule
              title="Daily Fieldy Brief"
              icon="🎧"
              pill="Auto"
              pillVariant="go"
              loading={dailyBrief.loading && !dailyBrief.data}
            >
              {dailyBrief.data ? (
                <>
                  {dailyBrief.data.yesterday && hasLiveData(dailyBrief.data.yesterday) && (
                    <div className="item-list">
                      <div className="brief-kicker">Yesterday recap</div>
                      {(dailyBrief.data.yesterday.items ?? []).map((item, i) => (
                        <LaneRow key={`y-${i}`} item={item} />
                      ))}
                    </div>
                  )}
                  {dailyBrief.data.today && hasLiveData(dailyBrief.data.today) && (
                    <div className="item-list">
                      <div className="brief-kicker">Today&apos;s voice highlights</div>
                      {(dailyBrief.data.today.items ?? [])
                        .filter((item) => {
                          const row = item as { source?: string };
                          return row.source === 'fieldy' || row.source === 'clickup';
                        })
                        .map((item, i) => (
                          <LaneRow key={`t-${i}`} item={item} />
                        ))}
                    </div>
                  )}
                  {dailyBrief.data.commitments_i_made &&
                    hasLiveData(dailyBrief.data.commitments_i_made) && (
                      <div className="item-list">
                        <div className="brief-kicker">Commitments I made</div>
                        {(dailyBrief.data.commitments_i_made.items ?? []).map((item, i) => (
                          <LaneRow key={`c-${i}`} item={item} />
                        ))}
                      </div>
                    )}
                  {dailyBrief.data.commitments_owed &&
                    hasLiveData(dailyBrief.data.commitments_owed) && (
                      <div className="item-list">
                        <div className="brief-kicker">Promises others made to me</div>
                        {(dailyBrief.data.commitments_owed.items ?? [])
                          .filter((item) => {
                            const id = clickupConnected ? clickupTaskId(item) : null;
                            return isTaskVisible(id ?? undefined);
                          })
                          .map((item, i) => {
                            const taskId = clickupConnected ? clickupTaskId(item) : null;
                            return (
                              <LaneRow
                                key={`o-${taskId ?? i}`}
                                item={item}
                                clickupConnected={clickupConnected}
                                onTaskUpdated={refreshClickUpLanes}
                                onTaskCompleted={handleTaskCompleted}
                                onTaskCompleteFailed={handleTaskCompleteFailed}
                                removing={isTaskRemoving(taskId ?? undefined)}
                              />
                            );
                          })}
                      </div>
                    )}
                  {dailyBrief.data.becomes_tasks &&
                    hasLiveData(dailyBrief.data.becomes_tasks) && (
                      <div className="item-list">
                        <div className="brief-kicker">Should become tasks</div>
                        {(dailyBrief.data.becomes_tasks.items ?? []).map((item, i) => (
                          <LaneRow key={`bt-${i}`} item={item} />
                        ))}
                      </div>
                    )}
                  {dailyBrief.data.yesterday &&
                    !hasLiveData(dailyBrief.data.yesterday) && (
                      <ConnectSource
                        sources={
                          dailyBrief.data.yesterday.sources?.length
                            ? dailyBrief.data.yesterday.sources
                            : [...STATIC_SOURCES.briefFieldy]
                        }
                        onConnect={onConnect}
                      />
                    )}
                </>
              ) : (
                <p>Your whole day captured — decisions, commitments, tasks.</p>
              )}
            </LaneModule>

            <LaneModule
              title="Echo · Meetings"
              icon="🤖"
              pill="ClickUp"
              defaultOpen={false}
            >
              <p>
                Plaud captures → Echo routes meeting output to All Meetings Log.
                Paste raw transcript when share URLs aren&apos;t fetchable.
              </p>
              <ConnectSource sources={[...STATIC_SOURCES.teamFieldy]} onConnect={onConnect} />
            </LaneModule>

            <LaneModule
              title="Health & Performance"
              icon="❤️"
              pill="Tracks only"
              defaultOpen={false}
              loading={healthMetrics.loading && !healthMetrics.data}
            >
              {healthMetrics.data && hasLiveData(healthMetrics.data) ? (
                <div className="metrics">
                  {healthMetrics.data.metrics?.whoop && (
                    <>
                      <div className="metric">
                        <div className="n">
                          {String(healthMetrics.data.metrics.whoop.recovery_score ?? '—')}
                        </div>
                        <div className="l">Recovery</div>
                      </div>
                      <div className="metric">
                        <div className="n">
                          {String(healthMetrics.data.metrics.whoop.hrv ?? '—')}
                        </div>
                        <div className="l">HRV</div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p>Whoop + Apple Health — tracked, never prescribed.</p>
              )}
              {healthMetrics.data?.metrics?.whoop ? null : (
                <ConnectSource sources={[...STATIC_SOURCES.healthWhoop]} onConnect={onConnect} />
              )}
            </LaneModule>

            <LaneModule title="Wellbeing Check-in" icon="🧠" defaultOpen={false}>
              <p>Daily check-in — support, not therapy.</p>
              <ConnectSource sources={[...STATIC_SOURCES.wellbeing]} onConnect={onConnect} />
            </LaneModule>
        </IntelLane>

        <IntelLane
          variant="calendar"
          title="Schedule"
          subtitle="Calendar · Week · Environment"
          badge={scheduleCount > 0 ? scheduleCount : null}
        >
            <LaneModule
              title="Today's Schedule"
              icon="📅"
              loading={dailyBrief.loading && !dailyBrief.data}
            >
              {dailyBrief.data?.today_schedule &&
              hasLiveData(dailyBrief.data.today_schedule) ? (
                <div className="item-list">
                  {(dailyBrief.data.today_schedule.items ?? []).map((item, i) => (
                    <LaneRow key={i} item={item} fallbackTime="TODAY" />
                  ))}
                </div>
              ) : dailyBrief.data?.today_schedule ? (
                <ConnectSource
                  sources={dailyBrief.data.today_schedule.sources}
                  onConnect={onConnect}
                />
              ) : (
                <p>Training, recovery, and family blocks protected.</p>
              )}
            </LaneModule>

            <LaneModule
              title="Week Ahead"
              icon="🗓️"
              defaultOpen={false}
              loading={weekAhead.loading && !weekAhead.data}
            >
              {weekAhead.data && hasLiveData(weekAhead.data) ? (
                <div className="item-list">
                  {(weekAhead.data.items ?? []).slice(0, 7).map((item, i) => (
                    <LaneRow key={i} item={item} />
                  ))}
                </div>
              ) : (
                <>
                  <p>Seven-day view with protected blocks.</p>
                  <ConnectSource
                    sources={[...STATIC_SOURCES.weekAhead]}
                    onConnect={onConnect}
                  />
                </>
              )}
            </LaneModule>

            <LaneModule title="Calendar Protection" icon="🛡️" defaultOpen={false}>
              <p>Training, recovery, and family blocks defended.</p>
              <ConnectSource
                sources={[...STATIC_SOURCES.calendarProtection]}
                onConnect={onConnect}
              />
            </LaneModule>

            <LaneModule
              title="Weather · Cleveland"
              icon="🌤️"
              pill={weatherLive ? 'Live' : 'CLE'}
              pillVariant={weatherLive ? 'go' : 'default'}
              defaultOpen={false}
              loading={weather.loading && !weather.data}
            >
              {weather.data && weatherLive ? (
                <div className="metrics">
                  <div className="metric">
                    <div className="n">{formatAdsMetric(weather.data.temp_f)}°</div>
                    <div className="l">Temp</div>
                  </div>
                  <div className="metric">
                    <div className="n" style={{ fontSize: 14 }}>
                      {weather.data.conditions ?? '—'}
                    </div>
                    <div className="l">Conditions</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="metrics">
                    <div className="metric">
                      <div className="n">—</div>
                      <div className="l">Temp</div>
                    </div>
                    <div className="metric">
                      <div className="n">—</div>
                      <div className="l">Conditions</div>
                    </div>
                  </div>
                  <ConnectSource
                    sources={
                      weather.data?.sources?.length
                        ? weather.data.sources
                        : [...STATIC_SOURCES.weather]
                    }
                    onConnect={onConnect}
                  />
                </>
              )}
            </LaneModule>
        </IntelLane>
      </div>
    </>
  );
}
