import { SEED_DEALS, type DealHealth } from '../data/seedDeals';
import './deal-command-center.css';

function idleClass(days: number): string {
  if (days >= 7) return 'deal-card__idle deal-card__idle--crit';
  if (days >= 4) return 'deal-card__idle deal-card__idle--warn';
  return 'deal-card__idle';
}

function healthClass(health: DealHealth): string {
  return `deal-card deal-card--${health}`;
}

interface DealCommandCenterProps {
  onAskDeal?: (prompt: string) => void;
}

export function DealCommandCenter({ onAskDeal }: DealCommandCenterProps) {
  return (
    <section className="deal-command hud-corners jarvis-glass" aria-label="Deal command center">
      <div className="deal-command__head">
        <div>
          <div className="deal-command__kicker">Pipeline · Flywheel · Idle flags</div>
          <h2 className="deal-command__title">Deal Command Center</h2>
          <p className="deal-command__sub">
            Every active file with stale-day alerts and six-touch revenue — math from the Brain,
            never guessed in the UI.
          </p>
        </div>
        <div className="deal-command__legend" aria-hidden="true">
          <span>
            <span className="deal-command__dot deal-command__dot--green" /> On pace
          </span>
          <span>
            <span className="deal-command__dot deal-command__dot--yellow" /> Slipping
          </span>
          <span>
            <span className="deal-command__dot deal-command__dot--red" /> Stale — act today
          </span>
        </div>
      </div>

      <div className="deal-command__grid">
        {SEED_DEALS.map((deal) => (
          <article key={deal.id} className={healthClass(deal.health)}>
            <div className="deal-card__top">
              <div className="deal-card__name">{deal.name}</div>
              <span className={idleClass(deal.idleDays)}>{deal.idleDays}d idle</span>
            </div>
            <div className="deal-card__addr">{deal.address}</div>
            <div className="deal-card__meta">
              <span className="deal-card__pill">{deal.vertical}</span>
              <span className="deal-card__pill">{deal.status}</span>
              <span className="deal-card__pill">{deal.entity}</span>
            </div>
            <div className="deal-card__revenue">{deal.flywheelRevenue}</div>
            <div className="deal-card__flywheel">
              {deal.flywheel.map((t) => (
                <span
                  key={t.key}
                  className={`deal-card__touch${t.live ? ' deal-card__touch--live' : ''}`}
                >
                  {t.label}
                </span>
              ))}
            </div>
            <p className="deal-card__note">{deal.note}</p>
            {onAskDeal && (
              <button
                type="button"
                className="deal-card__ask"
                onClick={() =>
                  onAskDeal(
                    `Brief me on ${deal.name} (${deal.address}). Idle ${deal.idleDays} days. What is the one move today?`,
                  )
                }
              >
                Ask Jarvis about {deal.name} →
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
