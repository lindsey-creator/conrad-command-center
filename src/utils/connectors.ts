/** Maps cockpit source ids to Connections page connector keys (when different). */
export const SOURCE_TO_CONNECTOR: Record<string, string> = {
  ghl: 'ghl',
  clickup: 'clickup',
  fieldy: 'fieldy',
  google_calendar: 'google_calendar',
  gmail: 'gmail',
  whoop: 'whoop',
  apple_health: 'apple_health',
  meta: 'meta',
  weather: 'weather',
  wellbeing_checkin: 'wellbeing_checkin',
  brain_scan: 'brain_scan',
  brain_memory: 'brain_memory',
};

export const OPTIONAL_SOURCE_HELP: Record<string, string> = {
  meta: 'Meta Ads API — not wired yet',
  weather: 'Weather API — not wired yet',
  wellbeing_checkin: 'Wellbeing check-in — in-app, no connector',
  brain_scan: 'Connect any data source below to fill blind spots',
  brain_memory: 'Train decisions in Feed the Brain',
};
