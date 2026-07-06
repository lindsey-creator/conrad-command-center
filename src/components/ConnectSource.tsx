import { formatSourceLabel } from '../api/brain';
import { OPTIONAL_SOURCE_HELP } from '../utils/connectors';
import './ConnectSource.css';

interface ConnectSourceProps {
  sources: string[];
  onConnect?: (source: string) => void;
}

export function ConnectSource({ sources, onConnect }: ConnectSourceProps) {
  if (!sources.length) return null;

  return (
    <div className="connect-sources">
      {sources.map((source) => {
        const label = formatSourceLabel([source]);
        const hint = OPTIONAL_SOURCE_HELP[source];
        const canLink =
          !!onConnect &&
          source !== 'brain_memory' &&
          source !== 'wellbeing_checkin';

        return (
          <div key={source} className="connect-row">
            {canLink ? (
              <button
                type="button"
                className="connect-link"
                onClick={() => onConnect(source)}
              >
                Connect {label}
              </button>
            ) : (
              <span className="connect-static">
                {source === 'brain_memory'
                  ? 'Train in Feed the Brain'
                  : `Connect ${label}`}
              </span>
            )}
            {hint && <span className="connect-hint">{hint}</span>}
          </div>
        );
      })}
    </div>
  );
}
