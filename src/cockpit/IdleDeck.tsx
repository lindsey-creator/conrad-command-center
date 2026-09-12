interface IdleDeckProps {
  brainOnline: boolean;
}

/** Higgsfield Idle north star — landscape void, dim Arc reticle, no cards. */
export function IdleDeck({ brainOnline }: IdleDeckProps) {
  return (
    <section className="idle-deck" aria-label="Idle Cybertruck HUD">
      <div className="idle-deck__brand">
        <h1>JARVIS</h1>
        <p className="idle-deck__mode">
          IDLE MODE
          <i aria-hidden="true" />
        </p>
        <hr />
        <p className="idle-deck__kicker">SYSTEM STATUS</p>
        <p className="idle-deck__status">
          {brainOnline ? 'NOMINAL' : 'STANDBY'}
          <i data-on={brainOnline} />
        </p>
        <p className="idle-deck__sub">
          {brainOnline ? 'ALL SYSTEMS OPERATIONAL' : 'BRAIN STANDBY · NO INVENTED LIVE'}
        </p>
        <figure className="idle-deck__truck">
          <svg viewBox="0 0 88 28" aria-hidden="true">
            <path
              d="M6 20 H18 L24 10 H62 L78 16 H84 V22 H6 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle cx="24" cy="22" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.1" />
            <circle cx="70" cy="22" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.1" />
          </svg>
          <figcaption>
            CYBERTRUCK
            <span>MARK III</span>
          </figcaption>
        </figure>
      </div>

      <div className="idle-deck__scan">
        <svg className="idle-deck__ridge" viewBox="0 0 640 80" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 62 L70 54 L140 58 L210 40 L280 48 L360 22 L430 46 L500 38 L570 52 L640 44"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.15"
          />
        </svg>
        <p>LANDSCAPE SCANNER</p>
        <p className="idle-deck__sub">REMOTE · OFF GRID · SECURE</p>
      </div>

      <div className="idle-deck__arc">
        <div className="idle-deck__reticle" aria-hidden="true">
          <i />
          <i />
          <i />
          <b />
        </div>
        <p>ARC CORE</p>
        <strong>DIM</strong>
      </div>
    </section>
  );
}
