/** Jenman (Davood121/jenman, MIT) holographic layers — always on, always moving. */
export function HudLayers() {
  return (
    <>
      <div className="hud-layer hud-layer--grid" aria-hidden="true" />
      <div className="hud-layer hud-layer--hex" aria-hidden="true" />
      <div className="hud-layer hud-layer--vignette" aria-hidden="true" />
      <div className="hud-layer hud-layer--scan" aria-hidden="true" />
      <div className="hud-layer hud-layer--beam" aria-hidden="true">
        <i className="hud-layer__beam" />
      </div>
      <div className="hud-layer hud-layer--crt" aria-hidden="true" />
      <div className="hud-brackets" aria-hidden="true">
        <i className="hud-brackets__cut hud-brackets__cut--tl" />
        <i className="hud-brackets__cut hud-brackets__cut--tr" />
        <i className="hud-brackets__cut hud-brackets__cut--bl" />
        <i className="hud-brackets__cut hud-brackets__cut--br" />
      </div>
    </>
  );
}
