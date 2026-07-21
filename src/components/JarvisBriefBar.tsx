import { useCallback } from 'react';
import { brain } from '../api/brain';
import { EMPIRE_UNITS } from '../data/seedDeals';
import { POLL_FAST_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData } from '../utils/renderItems';
import './jarvis-brief-bar.css';

export interface JarvisPromptRequest {
  text: string;
  focusInput?: boolean;
}

interface JarvisBriefBarProps {
  brainOnline: boolean;
  onJarvisPrompt?: (req: JarvisPromptRequest) => void;
}

const QUICK_PROMPTS: { label: string; text: string }[] = [
  { label: 'Top 3 moves', text: 'What are my top three money moves today? Be specific.' },
  { label: 'What burns today', text: 'What on the watch list will bite if I ignore it today?' },
  { label: 'Fieldy brief', text: 'Summarize yesterday from Fieldy — commitments I made and owed to me.' },
  { label: 'Council scan', text: 'Run the Executive Council daily money scan and tell me the one move I should not skip.' },
];

export function BrainDeployBanner() {
  return (
    <div className="brain-deploy-banner" role="alert">
      <strong>Brain not live on this URL.</strong> You may be on the legacy static dashboard, or
      Superman Brain is not running behind nginx. On Manus, run the one-liner below — then reload.
      <code>
        curl -fsSL
        https://raw.githubusercontent.com/lindsey-creator/conrad-command-center/main/deploy/manus-accurate.sh
        | bash
      </code>
    </div>
  );
}

export function JarvisBriefBar({ brainOnline, onJarvisPrompt }: JarvisBriefBarProps) {
  const fetchCouncil = useCallback(() => brain.councilScan(3), []);
  const fetchWatch = useCallback(() => brain.watchlist(), []);
  const fetchPulse = useCallback(() => brain.teamPulse(), []);

  const council = useBrainQuery('jarvis-council', fetchCouncil, { refreshMs: POLL_FAST_MS });
  const watch = useBrainQuery('jarvis-watch', fetchWatch, { refreshMs: POLL_FAST_MS });
  const pulse = useBrainQuery('jarvis-pulse', fetchPulse, { refreshMs: POLL_FAST_MS });

  const scanLive = council.data && hasLiveData(council.data);
  const watchLive = watch.data && hasLiveData(watch.data);
  const overdue = pulse.data?.overdue?.length ?? 0;
  const watchCount =
    council.data?.watch_count ??
    (watchLive ? (watch.data?.items?.length ?? 0) : 0);

  const councilHeadline = council.data?.headline;

  const headline = !brainOnline
    ? 'Jarvis is on standby — connect the Brain and your stack to run the company from one screen.'
    : councilHeadline
      ? councilHeadline.replace(/^Council ranked/, 'Executive Council ranked')
      : watchCount + overdue > 0
        ? `You have ${watchCount + overdue} operational fires${overdue ? ` (${overdue} overdue)` : ''}. Council has your top moves.`
        : scanLive && (council.data?.moves?.length ?? 0) > 0
          ? 'Pipeline is calm. Here is where to compound today.'
          : 'Systems online. Ask me anything — deals, team, brief, or route a task.';

  const moves =
    scanLive && (council.data?.moves?.length ?? 0) > 0
      ? (council.data?.moves ?? []).slice(0, 3)
      : [];

  const firePrompt = (text: string) => {
    onJarvisPrompt?.({ text, focusInput: true });
  };

  return (
    <div className="jarvis-brief">
      <div className="jarvis-brief__empire" aria-label="Empire units">
        <div className="jarvis-brief__empire-kicker">Eight units · one flywheel</div>
        {EMPIRE_UNITS.map((u) => (
          <span key={u.id} className="jarvis-brief__unit">
            <strong>{u.label}</strong> · {u.tag}
          </span>
        ))}
      </div>

      <div className="jarvis-brief__panel hud-corners">
        <div>
          <div className="jarvis-brief__status">
            {brainOnline ? 'JARVIS · SITUATION ROOM' : 'JARVIS · STANDBY'}
          </div>
          <p className="jarvis-brief__line">
            <em>{brainOnline ? 'Lindsey,' : 'Commander,'}</em> {headline}
          </p>
        </div>

        {moves.length > 0 ? (
          <div className="jarvis-brief__moves" aria-label="Top money moves">
            {moves.map((m, i) => (
              <div key={i} className="jarvis-brief__move">
                <strong>{m.council_seat ? `${m.council_seat.replace(/_/g, ' ')} · ` : ''}</strong>
                {m.dollars ? `${m.dollars} — ` : ''}
                <strong>{m.title}</strong>. {m.why}
              </div>
            ))}
          </div>
        ) : (
          <div className="jarvis-brief__moves">
            <div className="jarvis-brief__move">
              <strong>Ridgeline</strong> — 9d idle. Loop Baker on modular comps before margin.
            </div>
            <div className="jarvis-brief__move">
              <strong>Meta → GHL</strong> — speed-to-lead and A2P are the #1 revenue fire.
            </div>
            <div className="jarvis-brief__move">
              <strong>Approvals</strong> — nothing sends without your gate. Check the queue first.
            </div>
          </div>
        )}

        <div className="jarvis-brief__actions">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="jarvis-brief__chip"
              onClick={() => firePrompt(p.text)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
