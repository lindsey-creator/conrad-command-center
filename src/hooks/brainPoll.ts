/** Dashboard module refresh (override via VITE_BRAIN_POLL_MS in .env). */
const envPoll = Number(import.meta.env.VITE_BRAIN_POLL_MS);

export const POLL_MODULE_MS =
  Number.isFinite(envPoll) && envPoll > 0 ? envPoll : 30_000;

/** Watch list + money moves — faster cadence. */
export const POLL_FAST_MS = 15_000;

/** Connector status bar, hero metrics, connections page. */
export const POLL_CONNECTORS_MS = 60_000;

/** Offset between parallel module fetches to avoid thundering herd. */
export const POLL_STAGGER_MS = 400;
