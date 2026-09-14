import { CHAT_MODELS, type ChatModel } from '../api/brain';
import './model-chips.css';

/** Display names. The wire values stay lowercase — see CHAT_MODELS. */
const LABELS: Record<ChatModel, string> = {
  claude: 'CLAUDE',
  chatgpt: 'CHATGPT',
  gemini: 'GEMINI',
  grok: 'GROK',
  muse: 'MUSE',
};

/** The env var each lane needs, so a dark chip can say what is missing. */
const REQUIRES: Record<ChatModel, string> = {
  claude: 'ANTHROPIC_API_KEY',
  chatgpt: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
  grok: 'XAI_API_KEY',
  muse: 'MUSE_WEBHOOK_URL',
};

interface ModelChipsProps {
  selected: ChatModel;
  onSelect: (model: ChatModel) => void;
  /** Key presence per lane, straight from GET /health. */
  engines?: Partial<Record<ChatModel, boolean>>;
  disabled?: boolean;
}

/**
 * Brain selector. A lane with no key stays selectable on purpose — picking it
 * returns the Brain's honest "OPENAI_API_KEY is not set" rather than silently
 * routing to Claude, so an unconfigured lane is visible instead of disguised.
 */
export function ModelChips({ selected, onSelect, engines, disabled }: ModelChipsProps) {
  return (
    <div className="model-chips" role="radiogroup" aria-label="Brain">
      <span className="model-chips__kicker">BRAIN</span>
      {CHAT_MODELS.map((model) => {
        const live = engines?.[model] === true;
        // Undefined means /health has not answered yet — don't claim it's dark.
        const known = engines?.[model] !== undefined;
        const active = selected === model;
        return (
          <button
            key={model}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            className={`model-chip${active ? ' is-active' : ''}${live ? ' is-live' : ''}${
              known && !live ? ' is-dark' : ''
            }`}
            onClick={() => onSelect(model)}
            title={
              live
                ? `${LABELS[model]} — key present`
                : known
                  ? `${LABELS[model]} — no key. Set ${REQUIRES[model]} in Railway.`
                  : `${LABELS[model]} — checking…`
            }
          >
            <span className="model-chip__dot" aria-hidden="true" />
            {LABELS[model]}
          </button>
        );
      })}
    </div>
  );
}
