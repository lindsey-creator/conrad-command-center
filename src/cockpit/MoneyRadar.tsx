import { useCallback } from 'react';
import { brain, type MoneyMove } from '../api/brain';
import { POLL_FAST_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData } from '../utils/renderItems';

interface MoneyRadarProps {
  brainOnline: boolean;
  onAsk: (command: string) => void;
}

/** MONEY NOW — radar blips, not a pipeline table. */
export function MoneyRadar({ brainOnline, onAsk }: MoneyRadarProps) {
  const fetchMoves = useCallback(() => brain.topMoves(3), []);
  const { data } = useBrainQuery('money-radar', fetchMoves, { refreshMs: POLL_FAST_MS });
  const live = brainOnline && hasLiveData(data);
  const moves: MoneyMove[] = live ? (data?.moves ?? []).slice(0, 3) : [];
  const lock = moves[0];

  return (
    <section className="panel-glass money-radar" aria-label="Money now radar">
      <header>
        <b>MONEY NOW</b>
        <i className={lock ? 'is-proven' : 'is-claimed'}>{lock ? 'PROVEN' : 'CLAIMED'}</i>
      </header>
      <div className="money-radar__scope" aria-hidden>
        <span className="money-radar__ring" />
        <span className="money-radar__ring money-radar__ring--mid" />
        <span className="money-radar__sweep" />
        {moves.map((m, i) => (
          <em
            key={m.title}
            className="money-radar__blip"
            style={{
              ['--r' as string]: `${28 + i * 18}%`,
              ['--a' as string]: `${-40 + i * 55}deg`,
            }}
          />
        ))}
      </div>
      <p className="panel-glass__verdict">
        {lock
          ? [lock.title, lock.recommended_action || lock.why].filter(Boolean).join(' — ')
          : brainOnline
            ? 'Radar clear — no capital lock.'
            : 'Brain offline — no invented dollar.'}
      </p>
      <button type="button" className="panel-glass__go" onClick={() => onAsk(lock ? `Money now: ${lock.title}` : 'Money now — what dollar should I move?')}>
        LOCK
      </button>
    </section>
  );
}
