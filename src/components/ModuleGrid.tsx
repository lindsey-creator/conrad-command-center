import { useCallback } from 'react';
import { brain } from '../api/brain';
import { POLL_CONNECTORS_MS, POLL_FAST_MS, POLL_MODULE_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel } from '../utils/renderItems';
import { ConnectSource } from './ConnectSource';
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

  const moveCount = topMoves.data?.moves?.length ?? 0;
  const watchCount = countItems(watchlist.data);
  const todayCount = countItems(dailyBrief.data?.today_schedule);
  const connected = connectors.data?.connected_count ?? 0;
  const total = connectors.data?.total ?? 7;

  const topMoveDollars = topMoves.data?.moves?.[0]?.dollars ?? '—';

  return (
    <>
      {/* Priority scan row */}
      <div className="priority-scan" role="group" aria-label="Priority scan">
        <div className="scan-tile">
          <span className="scan-tile__dot scan-tile__dot--live" />
          <div className="scan-tile__kicker">Money</div>
          <div className="scan-tile__val scan-tile__val--money">
            {topMoves.loading && !topMoves.data ? '…' : moveCount || '—'}
          </div>
          <div className="scan-tile__lbl">
            {moveCount > 0 ? `Top: ${topMoveDollars}` : 'No moves yet'}
          </div>
        </div>
        <div className="scan-tile">
          <span className="scan-tile__dot" />
          <div className="scan-tile__kicker">Today</div>
          <div className="scan-tile__val">
            {dailyBrief.loading && !dailyBrief.data ? '…' : todayCount || '—'}
          </div>
          <div className="scan-tile__lbl">Schedule items</div>
        </div>
        <div className="scan-tile">
          <span
            className={`scan-tile__dot${watchCount > 0 ? ' scan-tile__dot--warn' : ''}`}
          />
          <div className="scan-tile__kicker">Watch</div>
          <div
            className={`scan-tile__val${watchCount > 0 ? ' scan-tile__val--warn' : ''}`}
          >
            {watchlist.loading && !watchlist.data ? '…' : watchCount || '—'}
          </div>
          <div className="scan-tile__lbl">Alerts today</div>
        </div>
        <div className="scan-tile">
          <span
            className={`scan-tile__dot${connected > 0 ? ' scan-tile__dot--live' : ''}`}
          />
          <div className="scan-tile__kicker">Connectors</div>
          <div
            className={`scan-tile__val${connected === total && connected > 0 ? ' scan-tile__val--live' : ''}`}
          >
            {connectors.loading && !connectors.data ? '…' : `${connected}/${total}`}
          </div>
          <div className="scan-tile__lbl">
            {connected === total && connected > 0 ? 'All live' : 'Sources linked'}
          </div>
        </div>
      </div>

      {/* Intel lanes */}
      <div className="intel-lanes intel-lanes--quad">
        {/* CRM lane */}
        <section className="intel-lane" aria-label="CRM intelligence">
          <div className="intel-lane__head">
            <h4 className="intel-lane__title">CRM</h4>
            <span className="intel-lane__count">Revenue · Leads</span>
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

            <LaneModule title="Meta Ads" icon="📈" pill="Pending" defaultOpen={false}>
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

            <LaneModule
              title="Money in Motion"
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
                <p>No money moves surfaced yet.</p>
              )}
            </LaneModule>
          </div>
        </section>

        {/* Tasks lane */}
        <section className="intel-lane" aria-label="Tasks and accountability">
          <div className="intel-lane__head">
            <h4 className="intel-lane__title">Tasks</h4>
            <span className="intel-lane__count">Pulse · Accountability</span>
          </div>
          <div className="intel-lane__body">
            <LaneModule
              title="Today's Watch List"
              icon="⚠️"
              pill={watchCount > 0 ? `${watchCount} alert` : 'Clear'}
              pillVariant={watchCount > 0 ? 'warn' : 'go'}
              loading={watchlist.loading && !watchlist.data}
            >
              {watchlist.data && hasLiveData(watchlist.data) ? (
                <div className="item-list">
                  {(watchlist.data.items ?? []).map((item, i) => (
                    <div key={i} className="lane-row">
                      <span className="lane-row__dot" />
                      <span className="lane-row__text">{itemLabel(item)}</span>
                    </div>
                  ))}
                </div>
              ) : watchlist.data ? (
                <ConnectSource sources={watchlist.data.sources} onConnect={onConnect} />
              ) : (
                <p>The few things that bite today if ignored.</p>
              )}
            </LaneModule>

            <LaneModule
              title="Team Pulse"
              icon="👥"
              pill="Accountability"
              pillVariant="warn"
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
                      <span className="lane-row__text">
                        <strong>{g.person}</strong>: {g.committed} → {g.actual}.{' '}
                        {g.suggested_move}
                      </span>
                    </div>
                  ))}
                  {teamPulse.data.overdue.map((o, i) => (
                    <div key={`o-${i}`} className="lane-row">
                      <span className="lane-row__text">
                        <strong>{o.person}</strong>: {o.task} ({o.days_late}d late)
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </LaneModule>

            <LaneModule
              title="Empire Blind Spots"
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
                      <div key={i} className="lane-row">
                        <span className="lane-row__text">{itemLabel(item)}</span>
                      </div>
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

            <LaneModule title="Issue a Task" icon="✅" pill="On the road" defaultOpen={false}>
              <p>Voice or text → routed to ClickUp with context.</p>
              <ConnectSource sources={[...STATIC_SOURCES.issueTask]} onConnect={onConnect} />
            </LaneModule>
          </div>
        </section>

        {/* Audio / Fieldy lane */}
        <section className="intel-lane" aria-label="Audio and field intelligence">
          <div className="intel-lane__head">
            <h4 className="intel-lane__title">Audio / Fieldy</h4>
            <span className="intel-lane__count">Voice · Brief</span>
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
                        <div key={`y-${i}`} className="lane-row">
                          <span className="lane-row__text">{itemLabel(item)}</span>
                        </div>
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
                          <div key={`t-${i}`} className="lane-row">
                            <span className="lane-row__text">{itemLabel(item)}</span>
                          </div>
                        ))}
                    </div>
                  )}
                  {dailyBrief.data.commitments_i_made &&
                    hasLiveData(dailyBrief.data.commitments_i_made) && (
                      <div className="item-list">
                        <div className="brief-kicker">Commitments I made</div>
                        {(dailyBrief.data.commitments_i_made.items ?? []).map((item, i) => (
                          <div key={`c-${i}`} className="lane-row">
                            <span className="lane-row__text">{itemLabel(item)}</span>
                          </div>
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

        {/* Calendar lane */}
        <section className="intel-lane" aria-label="Calendar and environment">
          <div className="intel-lane__head">
            <h4 className="intel-lane__title">Calendar</h4>
            <span className="intel-lane__count">Schedule · Environment</span>
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
                    <div key={i} className="lane-row">
                      <span className="lane-row__time">TODAY</span>
                      <span className="lane-row__text">{itemLabel(item)}</span>
                    </div>
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
                    <div key={i} className="lane-row">
                      <span className="lane-row__text">{itemLabel(item)}</span>
                    </div>
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
