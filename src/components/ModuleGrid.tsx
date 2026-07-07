import { useCallback } from 'react';
import { brain } from '../api/brain';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel } from '../utils/renderItems';
import { ConnectSource } from './ConnectSource';
import { ModuleCard } from './ModuleCard';

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
  briefCalendar: ['google_calendar'],
} as const;

interface ModuleGridProps {
  onConnect?: (source: string) => void;
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

  const blindspots = useBrainQuery('blindspots', fetchBlindspots);
  const watchlist = useBrainQuery('watchlist', fetchWatchlist);
  const topMoves = useBrainQuery('top-moves', fetchTopMoves);
  const teamPulse = useBrainQuery('team-pulse', fetchTeamPulse);
  const dailyBrief = useBrainQuery('daily-brief', fetchBrief);
  const ghlCrm = useBrainQuery('ghl-crm', fetchGhl);
  const healthMetrics = useBrainQuery('health-metrics', fetchHealth);
  const weekAhead = useBrainQuery('week-ahead', fetchWeek);

  return (
    <div className="grid">
      {/* Empire Blind Spots */}
      <ModuleCard
        title="Empire Blind Spots"
        dotColor="var(--crit)"
        pill="Scan"
        pillVariant="crit"
        span2
        loading={blindspots.loading && !blindspots.data}
      >
        <div className="body">
          What you're not seeing across the 8 units. The Brain fills this — the
          point is you don't have to go looking.
        </div>
        {blindspots.data && hasLiveData(blindspots.data) && (
          <div className="body item-list">
            {(blindspots.data.items ?? []).length > 0 ? (
              (blindspots.data.items ?? []).map((item, i) => (
                <div key={i} className="list-row">
                  {itemLabel(item)}
                </div>
              ))
            ) : (
              <div className="list-row">No blind spots from connected sources.</div>
            )}
          </div>
        )}
        {blindspots.data && !hasLiveData(blindspots.data) && (
          <ConnectSource sources={blindspots.data.sources} onConnect={onConnect} />
        )}
      </ModuleCard>

      {/* Today's Watch List */}
      <ModuleCard
        title="Today's Watch List"
        dotColor="var(--warn)"
        pill={watchlist.data && hasLiveData(watchlist.data) ? 'Live' : 'Watch'}
        loading={watchlist.loading && !watchlist.data}
      >
        <div className="body">The few things that bite today if ignored.</div>
        {watchlist.data && hasLiveData(watchlist.data) ? (
          <div className="body item-list">
            {(watchlist.data.items ?? []).map((item, i) => (
              <div key={i} className="list-row">
                {itemLabel(item)}
              </div>
            ))}
          </div>
        ) : watchlist.data ? (
          <ConnectSource sources={watchlist.data.sources} onConnect={onConnect} />
        ) : null}
      </ModuleCard>

      {/* Money in Motion */}
      <ModuleCard
        title="Money in Motion"
        icon="💰"
        pill="Top-3"
        pillVariant="go"
        loading={topMoves.loading && !topMoves.data}
      >
        {topMoves.data && !hasLiveData(topMoves.data) ? (
          <>
            <div className="body">
              Active deals + today's highest-value moves, each with the number and
              a one-tap approve.
              {topMoves.data.decisions_known > 0 && (
                <>
                  {' '}
                  Brain knows {topMoves.data.decisions_known} trained decision
                  {topMoves.data.decisions_known === 1 ? '' : 's'}.
                </>
              )}
            </div>
            <ConnectSource sources={topMoves.data.sources} onConnect={onConnect} />
          </>
        ) : topMoves.data && topMoves.data.moves.length > 0 ? (
          <div className="moves-list">
            {topMoves.data.moves.map((move, i) => (
              <div className="move-item" key={i}>
                <div className="dollars">{move.dollars ?? '—'}</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{move.title}</div>
                <div className="why">{move.why}</div>
                <button type="button" className="approve-btn" disabled>
                  Approval Queue · coming
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="body">No money moves surfaced yet.</div>
        )}
      </ModuleCard>

      {/* GoHighLevel CRM */}
      <ModuleCard
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
      </ModuleCard>

      {/* Meta Ads */}
      <ModuleCard title="Meta Ads" icon="📈" pill="Loading">
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
      </ModuleCard>

      {/* Team Pulse */}
      <ModuleCard
        title="Team Pulse"
        icon="👥"
        pill="Accountability"
        pillVariant="warn"
        loading={teamPulse.loading && !teamPulse.data}
      >
        {teamPulse.data && !hasLiveData(teamPulse.data) ? (
          <>
            <div className="body">
              Who said they'd do what — and whether it moved. The radar that
              watches for holes so you don't have to.
            </div>
            <ConnectSource sources={teamPulse.data.sources} onConnect={onConnect} />
            <ConnectSource sources={[...STATIC_SOURCES.teamFieldy]} onConnect={onConnect} />
          </>
        ) : teamPulse.data ? (
          <div className="body">
            {teamPulse.data.gaps.map((g, i) => (
              <div key={i}>
                <strong>{g.person}</strong>: {g.committed} → {g.actual}.{' '}
                {g.suggested_move}
              </div>
            ))}
            {teamPulse.data.overdue.map((o, i) => (
              <div key={`o-${i}`}>
                <strong>{o.person}</strong>: {o.task} ({o.days_late}d late)
              </div>
            ))}
          </div>
        ) : null}
      </ModuleCard>

      {/* Daily Fieldy Brief */}
      <ModuleCard
        title="Daily Fieldy Brief"
        icon="🎧"
        pill="Auto"
        pillVariant="go"
        span2
        loading={dailyBrief.loading && !dailyBrief.data}
      >
        {dailyBrief.data ? (
          <>
            <div className="body">
              You wear it all day, so the Brain gets your whole day: decisions
              made, what you committed to, what others promised you, and what
              turns into a task. Delivered every morning.
            </div>
            {dailyBrief.data.top_money_moves &&
              hasLiveData(dailyBrief.data.top_money_moves) && (
                <div className="body item-list">
                  <div className="brief-kicker">Top money moves</div>
                  {(dailyBrief.data.top_money_moves.items ?? []).map(
                    (item, i) => (
                      <div key={`m-${i}`} className="list-row">
                        {itemLabel(item)}
                      </div>
                    ),
                  )}
                </div>
              )}
            {dailyBrief.data.yesterday &&
              hasLiveData(dailyBrief.data.yesterday) && (
                <div className="body item-list">
                  <div className="brief-kicker">Audio / meeting recap</div>
                  {(dailyBrief.data.yesterday.items ?? []).map((item, i) => (
                    <div key={`y-${i}`} className="list-row">
                      {itemLabel(item)}
                    </div>
                  ))}
                </div>
              )}
            {dailyBrief.data.today && hasLiveData(dailyBrief.data.today) && (
              <div className="body item-list">
                <div className="brief-kicker">Today&apos;s voice highlights</div>
                {(dailyBrief.data.today.items ?? [])
                  .filter((item) => {
                    const row = item as { source?: string };
                    return row.source === 'fieldy' || row.source === 'clickup';
                  })
                  .map((item, i) => (
                    <div key={`t-${i}`} className="list-row">
                      {itemLabel(item)}
                    </div>
                  ))}
              </div>
            )}
            {dailyBrief.data.watch_list &&
              hasLiveData(dailyBrief.data.watch_list) && (
                <div className="body item-list">
                  <div className="brief-kicker">Watch list</div>
                  {(dailyBrief.data.watch_list.items ?? []).map((item, i) => (
                    <div key={`w-${i}`} className="list-row">
                      {itemLabel(item)}
                    </div>
                  ))}
                </div>
              )}
            {dailyBrief.data.commitments_i_made &&
              hasLiveData(dailyBrief.data.commitments_i_made) && (
                <div className="body item-list">
                  <div className="brief-kicker">Commitments I made</div>
                  {(dailyBrief.data.commitments_i_made.items ?? []).map(
                    (item, i) => (
                      <div key={`c-${i}`} className="list-row">
                        {itemLabel(item)}
                      </div>
                    ),
                  )}
                </div>
              )}
            {dailyBrief.data.top_money_moves &&
              !hasLiveData(dailyBrief.data.top_money_moves) && (
                <ConnectSource
                  sources={dailyBrief.data.top_money_moves.sources}
                  onConnect={onConnect}
                />
              )}
            {dailyBrief.data.watch_list &&
              !hasLiveData(dailyBrief.data.watch_list) && (
                <ConnectSource
                  sources={dailyBrief.data.watch_list.sources}
                  onConnect={onConnect}
                />
              )}
            {dailyBrief.data.commitments_i_made &&
              !hasLiveData(dailyBrief.data.commitments_i_made) && (
                <ConnectSource
                  sources={
                    dailyBrief.data.commitments_i_made.sources?.length
                      ? dailyBrief.data.commitments_i_made.sources
                      : [...STATIC_SOURCES.briefFieldy]
                  }
                  onConnect={onConnect}
                />
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
        ) : null}
      </ModuleCard>

      {/* Today's Schedule */}
      <ModuleCard
        title="Today's Schedule"
        icon="📅"
        loading={dailyBrief.loading && !dailyBrief.data}
      >
        <div className="body">
          Schedule with training, recovery, and family blocks protected.
        </div>
        {dailyBrief.data?.today_schedule &&
          hasLiveData(dailyBrief.data.today_schedule) && (
            <div className="body item-list">
              {(dailyBrief.data.today_schedule.items ?? []).map((item, i) => (
                <div key={i} className="list-row">
                  {itemLabel(item)}
                </div>
              ))}
            </div>
          )}
        {dailyBrief.data?.today_schedule &&
          !hasLiveData(dailyBrief.data.today_schedule) && (
            <ConnectSource
              sources={dailyBrief.data.today_schedule.sources}
              onConnect={onConnect}
            />
          )}
      </ModuleCard>

      {/* Week Ahead */}
      <ModuleCard
        title="Week Ahead"
        icon="🗓️"
        loading={weekAhead.loading && !weekAhead.data}
      >
        {weekAhead.data && hasLiveData(weekAhead.data) ? (
          <div className="body item-list">
            {(weekAhead.data.items ?? []).slice(0, 7).map((item, i) => (
              <div key={i} className="list-row">
                {itemLabel(item)}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="body">Seven-day view with protected blocks.</div>
            <ConnectSource
              sources={[...STATIC_SOURCES.weekAhead]}
              onConnect={onConnect}
            />
          </>
        )}
      </ModuleCard>

      {/* Weather */}
      <ModuleCard title="Weather · Cleveland" icon="🌤️">
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
      </ModuleCard>

      {/* Health & Performance */}
      <ModuleCard
        title="Health & Performance"
        icon="❤️"
        pill="Tracks · never prescribes"
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
            {healthMetrics.data.metrics?.apple_health && (
              <div className="metric">
                <div className="n">
                  {String(healthMetrics.data.metrics.apple_health.sleep_hours ?? '—')}
                </div>
                <div className="l">Sleep</div>
              </div>
            )}
          </div>
        ) : (
          <div className="body">
            Apple Health + Whoop (recovery, HRV, sleep, strain), supplement
            schedule, peptide protocol, diet — tracked and reminded. Clinical
            decisions route to your provider.
          </div>
        )}
        {healthMetrics.data?.metrics?.whoop ? null : (
          <ConnectSource
            sources={[...STATIC_SOURCES.healthWhoop]}
            onConnect={onConnect}
          />
        )}
        {healthMetrics.data?.metrics?.apple_health ? null : (
          <ConnectSource
            sources={[...STATIC_SOURCES.healthApple]}
            onConnect={onConnect}
          />
        )}
      </ModuleCard>

      {/* Calendar Protection */}
      <ModuleCard title="Calendar Protection" icon="🛡️">
        <div className="body">
          Training, recovery, and family blocks defended on your calendar.
        </div>
        <ConnectSource
          sources={[...STATIC_SOURCES.calendarProtection]}
          onConnect={onConnect}
        />
      </ModuleCard>

      {/* Wellbeing Check-in */}
      <ModuleCard title="Wellbeing Check-in" icon="🧠" pill="Support only">
        <div className="body">
          Daily check-in and pattern surfacing — support, not therapy. Routes to
          your real professionals when needed.
        </div>
        <ConnectSource sources={[...STATIC_SOURCES.wellbeing]} onConnect={onConnect} />
      </ModuleCard>

      {/* Issue a Task */}
      <ModuleCard title="Issue a Task" icon="✅" pill="On the road">
        <div className="body">
          Voice or a line of text → routed to the right person in ClickUp with
          context. Approvals from your phone.
        </div>
        <button type="button" className="approve-btn" disabled>
          Approval Queue · coming
        </button>
        <ConnectSource sources={[...STATIC_SOURCES.issueTask]} onConnect={onConnect} />
      </ModuleCard>
    </div>
  );
}
