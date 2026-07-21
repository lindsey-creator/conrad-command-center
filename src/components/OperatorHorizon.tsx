import { useCallback } from 'react';
import { brain, type OperatorHorizonResponse } from '../api/brain';
import { POLL_MODULE_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import './operator-horizon.css';

const OFFLINE_HORIZON: OperatorHorizonResponse = {
  status: 'ok',
  sources: ['brain_operator'],
  readiness_score: 42,
  attention_budget: { active_fires: 0, connector_gaps: 4 },
  operator_mantra:
    'Deploy Brain + train memory to unlock live horizon intel. Offline mode still shows the operator playbook.',
  signals: {
    now: [
      {
        horizon: 'now',
        title: 'Approval gate first',
        insight: 'Nothing sends without you — elite operators clear the queue before new fires.',
        recommended_move: 'Open pending approvals; one decision unlocks team velocity.',
        council_seat: 'chief_of_staff',
      },
    ],
    edge_72h: [
      {
        horizon: 'edge_72h',
        title: 'Speed-to-lead moat',
        insight: 'Most lenders optimize ads; winners optimize response minutes + recorded calls.',
        recommended_move: 'Wire Meta → GHL → ClickUp when Brain is live.',
        council_seat: 'rainmaker',
      },
    ],
    horizon_30d: [
      {
        horizon: 'horizon_30d',
        title: 'Memory as weapon',
        insight: 'Generic AI cannot diverge from your rules — trained decisions are the moat.',
        recommended_move: 'Train 10 historical deals; run shadow validation.',
        council_seat: 'deal_hunter',
      },
    ],
  },
  contrarian: [
    {
      title: 'Silent pass on modular',
      what_most_operators_do: 'Wait for one perfect comp set.',
      contrarian_edge: 'Conditional GO with Baker locked beats market assuming you walked.',
      your_move: 'Ask Jarvis: where am I reflex-passing money on Ridgeline?',
      council_seat: 'deal_hunter',
    },
  ],
};

interface OperatorHorizonProps {
  brainOnline: boolean;
  onJarvisPrompt?: (text: string) => void;
}

function seatLabel(seat?: string): string {
  if (!seat) return '';
  return seat.replace(/_/g, ' ');
}

export function OperatorHorizon({ brainOnline, onJarvisPrompt }: OperatorHorizonProps) {
  const fetchHorizon = useCallback(
    () => (brainOnline ? brain.operatorHorizon(false) : Promise.resolve(OFFLINE_HORIZON)),
    [brainOnline],
  );

  const { data, loading } = useBrainQuery('operator-horizon', fetchHorizon, {
    refreshMs: POLL_MODULE_MS,
  });

  const h = data ?? (loading ? null : OFFLINE_HORIZON);
  if (!h) return null;

  const fires = h.attention_budget?.active_fires ?? 0;
  const score = h.readiness_score ?? 0;

  const prompts = [
    'What am I missing that competitors will see in 72 hours?',
    'Give me the contrarian move on my top deal — 10 steps ahead.',
    'Separate my next 24h vs 30-day structural moves.',
  ];

  return (
    <section className="operator-horizon" aria-label="Operator horizon — ten steps ahead">
      <div className="operator-horizon__frame hud-corners jarvis-glass">
        <div className="operator-horizon__head">
          <div>
            <div className="operator-horizon__kicker">Ten steps ahead · operator horizon</div>
            <h2 className="operator-horizon__title">See around corners</h2>
          </div>
          <div className="operator-horizon__readiness" title="Readiness blends memory, connectors, and active fires">
            <div className="operator-horizon__score">{score}</div>
            <div className="operator-horizon__score-lbl">
              Readiness {fires > 0 ? `· ${fires} fires` : ''}
            </div>
          </div>
        </div>

        <p className="operator-horizon__mantra">{h.operator_mantra}</p>
        {h.narration && <div className="operator-horizon__narration">{h.narration}</div>}
        {!brainOnline && (
          <p className="operator-horizon__offline">
            Brain offline — showing operator playbook. Connect Superman Brain for live horizon +
            contrarian synthesis.
          </p>
        )}

        <div className="operator-horizon__lanes">
          <div className="operator-horizon__lane operator-horizon__lane--now">
            <div className="operator-horizon__lane-kicker">Now · 0–24h</div>
            {(h.signals?.now ?? []).map((s, i) => (
              <div key={i} className="operator-horizon__signal">
                <div className="operator-horizon__signal-title">{s.title}</div>
                <div className="operator-horizon__signal-insight">{s.insight}</div>
                <div className="operator-horizon__signal-move">{s.recommended_move}</div>
              </div>
            ))}
          </div>
          <div className="operator-horizon__lane operator-horizon__lane--edge">
            <div className="operator-horizon__lane-kicker">Edge · 72h</div>
            {(h.signals?.edge_72h ?? []).map((s, i) => (
              <div key={i} className="operator-horizon__signal">
                <div className="operator-horizon__signal-title">{s.title}</div>
                <div className="operator-horizon__signal-insight">{s.insight}</div>
                <div className="operator-horizon__signal-move">{s.recommended_move}</div>
              </div>
            ))}
          </div>
          <div className="operator-horizon__lane operator-horizon__lane--30d">
            <div className="operator-horizon__lane-kicker">Horizon · 30d</div>
            {(h.signals?.horizon_30d ?? []).map((s, i) => (
              <div key={i} className="operator-horizon__signal">
                <div className="operator-horizon__signal-title">{s.title}</div>
                <div className="operator-horizon__signal-insight">{s.insight}</div>
                <div className="operator-horizon__signal-move">{s.recommended_move}</div>
              </div>
            ))}
          </div>
        </div>

        {(h.contrarian?.length ?? 0) > 0 && (
          <div className="operator-horizon__contrarian">
            <div className="operator-horizon__contrarian-kicker">Contrarian edge · what others aren&apos;t doing</div>
            <div className="operator-horizon__cards">
              {h.contrarian!.map((c, i) => (
                <div key={i} className="operator-horizon__card">
                  <div className="operator-horizon__card-title">
                    {c.title}
                    {c.council_seat ? (
                      <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 10 }}>
                        {' '}
                        · {seatLabel(c.council_seat)}
                      </span>
                    ) : null}
                  </div>
                  <div className="operator-horizon__card-row">
                    <strong>Crowd</strong> {c.what_most_operators_do}
                  </div>
                  <div className="operator-horizon__card-row">
                    <strong>Edge</strong> {c.contrarian_edge}
                  </div>
                  <div className="operator-horizon__card-move">{c.your_move}</div>
                </div>
              ))}
            </div>
          </div>
        )}

            {onJarvisPrompt && (
          <div className="operator-horizon__ask">
            {prompts.map((p) => (
              <button
                key={p}
                type="button"
                className="operator-horizon__chip"
                onClick={() => onJarvisPrompt(p)}
              >
                {p.length > 48 ? `${p.slice(0, 46)}…` : p}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
