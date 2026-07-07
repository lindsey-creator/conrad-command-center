import { useCallback } from 'react';
import { brain } from '../api/brain';
import { POLL_CONNECTORS_MS, POLL_FAST_MS, POLL_MODULE_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import {
  hasLiveData,
  itemLabel,
  itemSeverity,
  itemTime,
  type LaneRowSeverity,
} from '../utils/renderItems';
import { ConnectSource } from './ConnectSource';
import { LaneModule } from './LaneModule';
import { RhinoLaneIcon } from './RhinoLaneIcon';
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

function LaneRow({
  item,
  fallbackTime,
}: {
  item: unknown;
  fallbackTime?: string;
}) {
  const severity = itemSeverity(item);
  const time = itemTime(item) ?? fallbackTime ?? null;

  return (
    <div className="lane-row">
      {time ? (
        <span className="lane-row__time">{time}</span>
      ) : (
        <span className={`lane-row__dot lane-row__dot--${severity}`} aria-hidden="true" />
      )}
      <span className="lane-row__text">{itemLabel(item)}</span>
    </div>
  );
}

function OverdueRow({
  person,
  task,
  daysLate,
}: {
  person: string;
  task: string;
  daysLate: number;
}) {
  const severity: LaneRowSeverity = daysLate >= 7 ? 'crit' : 'warn';
  return (
    <div className="lane-row">
      <span className={`lane-row__dot lane-row__dot--${severity}`} aria-hidden="true" />
      <span className="lane-row__text">
        <strong>{person}</strong>: {task} ({daysLate}d late)
      </span>
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
  const fetchHealth = useCallback(() => brain.healthMetrics(), []);
  const fetchWeek = useCallback(() => brain.weekAhead(), []);
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
  const healthMetrics = useBrainQuery('health-metrics', fetchHealth, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 6,
  });
  const weekAhead = useBrainQuery('week-ahead', fetchWeek, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 7,
  });
  const connectors = useBrainQuery('scan-connectors', fetchConnectors, {
    refreshMs: POLL_CONNECTORS_MS,
    staggerMs: POLL_STAGGER_MS * 8,
  });

  const ghlLive = ghlCrm.data && hasLiveData(ghlCrm.data);
  const ghlLeads = ghlLive ? (ghlCrm.data?.new_leads ?? 0) : null;
  const ghlUnread = ghlLive ? (ghlCrm.data?.unread_texts ?? 0) : null;

  const briefTodayCount =
    countItems(dailyBrief.data?.today) + countItems(dailyBrief.data?.today_schedule);

  const watchCount = countItems(watchlist.data);
  const overdueCount = teamPulse.data?.overdue?.length ?? 0;
  const watchTotal = watchCount + overdueCount;

  const connected = connectors.data?.connected_count ?? 0;
  const total = connectors.data?.total ?? 7;

  const topMoveDollars = topMoves.data?.moves?.[0]?.dollars ?? '—';

  return (
    <>
      <div className="priority-horns-kicker">PRIORITY HORNS</div>
      <div className="priority-scan" role="group" aria-label="Priority horns">
        <div className="scan-tile">
          <span
            className={`scan-tile__dot${ghlLive ? ' scan-tile__dot--live' : ''}`}
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
        <div className="scan-tile">
          <span className="scan-tile__dot" />
          <div className="scan-tile__kicker">Today</div>
          <div className="scan-tile__val">
            {dailyBrief.loading && !dailyBrief.data ? '…' : briefTodayCount || '—'}
          </div>
          <div className="scan-tile__lbl">Brief · schedule · voice</div>
        </div>
        <div className="scan-tile">
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
        <div className="scan-tile">
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
        <section className="intel-lane" aria-label="Revenue intelligence">
          <div className="intel-lane__head">
            <RhinoLaneIcon variant="crm" />
            <h4 className="intel-lane__title">Revenue</h4>
            <span className="intel-lane__count">GHL · Pipeline · Meta</span>
          </div>
          <div className="intel-lane__body">
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
              pill="Not wired"
              pillVariant="warn"
              defaultOpen={false}
            >
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
              <ConnectSource sources={[...STATIC_SOURCES.meta]} onConnect={onConnect} />
            </LaneModule>
          </div>
        </section>

        <section className="intel-lane" aria-label="Operations intelligence">
          <div className="intel-lane__head">
            <RhinoLaneIcon variant="tasks" />
            <h4 className="intel-lane__title">Operations</h4>
            <span className="intel-lane__count">ClickUp · Pulse · Blindspots</span>
          </div>
          <div className="intel-lane__body">
            <LaneModule
              title="ClickUp · Overdue & Alerts"
              icon="✅"
              pill={watchTotal > 0 ? `${watchTotal} open` : 'Clear'}
              pillVariant={watchTotal > 0 ? 'warn' : 'go'}
              loading={watchlist.loading && !watchlist.data}
            >
              {watchlist.data && hasLiveData(watchlist.data) ? (
                <div className="item-list">
                  {(watchlist.data.items ?? []).map((item, i) => (
                    <LaneRow key={i} item={item} />
                  ))}
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
                  {teamPulse.data.gaps.map((g, i) => (
                    <div key={i} className="lane-row">
                      <span className="lane-row__dot lane-row__dot--warn" aria-hidden="true" />
                      <span className="lane-row__text">
                        <strong>{g.person}</strong>: {g.committed} → {g.actual}.{' '}
                        {g.suggested_move}
                      </span>
                    </div>
                  ))}
                  {teamPulse.data.overdue.map((o, i) => (
                    <OverdueRow
                      key={`o-${i}`}
                      person={o.person}
                      task={o.task}
                      daysLate={o.days_late}
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

            <LaneModule title="Issue a Task" icon="📋" pill="Rhino Robot" defaultOpen={false}>
              <p>Voice or text → routed via Rhino Robot to ClickUp with context.</p>
              <ConnectSource sources={[...STATIC_SOURCES.issueTask]} onConnect={onConnect} />
            </LaneModule>
          </div>
        </section>

        <section className="intel-lane" aria-label="Echo intelligence">
          <div className="intel-lane__head">
            <RhinoLaneIcon variant="audio" />
            <h4 className="intel-lane__title">Echo Intel</h4>
            <span className="intel-lane__count">Fieldy · Brief · Rhino Robot</span>
          </div>
          <div className="intel-lane__body">
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
              title="Rhino Robot · Meetings"
              icon="🤖"
              pill="ClickUp"
              defaultOpen={false}
            >
              <p>
                Plaud captures → Rhino Robot routes meeting output to All Meetings Log.
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
          </div>
        </section>

        <section className="intel-lane" aria-label="Schedule intelligence">
          <div className="intel-lane__head">
            <RhinoLaneIcon variant="calendar" />
            <h4 className="intel-lane__title">Schedule</h4>
            <span className="intel-lane__count">Calendar · Week · Environment</span>
          </div>
          <div className="intel-lane__body">
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

            <LaneModule title="Weather · Cleveland" icon="🌤️" defaultOpen={false}>
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
              <ConnectSource sources={[...STATIC_SOURCES.weather]} onConnect={onConnect} />
            </LaneModule>
          </div>
        </section>
      </div>
    </>
  );
}
