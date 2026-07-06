export type ConnectSourceStatus = 'connect_source' | 'ok' | string;

export interface ConnectSourceResponse {
  status: ConnectSourceStatus;
  sources: string[];
  items?: unknown[];
}

export interface MoneyMove {
  title: string;
  dollars: string | number | null;
  why: string;
  recommended_action: string;
  deal_ref?: string;
}

export interface TopMoneyMovesResponse {
  status: ConnectSourceStatus;
  sources: string[];
  limit: number;
  moves: MoneyMove[];
  decisions_known: number;
}

export interface TeamPulseGap {
  person: string;
  committed: string;
  actual: string;
  suggested_move: string;
}

export interface TeamPulseOverdue {
  person: string;
  task: string;
  due: string;
  days_late: number;
}

export interface TeamPulseResponse {
  status: ConnectSourceStatus;
  sources: string[];
  overdue: TeamPulseOverdue[];
  gaps: TeamPulseGap[];
}

export interface BriefSection extends ConnectSourceResponse {
  items: unknown[];
}

export interface DailyBriefResponse {
  status: ConnectSourceStatus;
  sources: string[];
  today?: BriefSection;
  watch_list?: BriefSection;
  accountability?: BriefSection & { gaps?: unknown[] };
  commitments_i_made?: BriefSection;
  top_money_moves?: BriefSection & { limit?: number };
  yesterday: BriefSection;
  today_schedule: BriefSection;
  commitments_owed: BriefSection;
  becomes_tasks: BriefSection;
}

function getBase(): string {
  const env = import.meta.env.VITE_BRAIN_API;
  if (env) return env.replace(/\/$/, '');
  // Production build served by Brain on the same origin — relative API paths.
  if (import.meta.env.PROD) return '';
  return '/api';
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface DecisionRecord {
  id: string;
  text: string;
  metadata: Record<string, unknown>;
  age_days?: number;
  recency_weight?: number;
}

export interface DecisionsHistoryResponse {
  decisions: DecisionRecord[];
}

export interface VoiceTrainResult {
  id: string;
  recipient: string;
  context: string;
  classify_method: string;
}

export interface DealDecisionInput {
  address: string;
  purchase_price: number;
  arv: number;
  rehab_estimate?: number;
  monthly_rent?: number;
  monthly_debt_service?: number;
  other_costs?: number;
  verdict: string;
  reasoning: string;
  notes?: string;
}

export interface DealDecisionResult {
  id: string;
  verdict: string;
  rules_verdict: string;
  diverged: boolean;
  engine: Record<string, unknown>;
  divergence_note: string;
}

export interface ShadowDivergence {
  address?: string;
  human_verdict: string;
  rules_verdict: string;
  diverged: boolean;
  reasoning?: string;
  margin_vs_arv?: number;
  dscr?: number | null;
}

export interface ShadowValidationResult {
  n: number;
  matches: number;
  mismatches: number;
  match_rate: number | null;
  divergences: ShadowDivergence[];
  verdict: string;
}

export interface ChatDealFields {
  purchase_price: number;
  rehab_estimate: number;
  arv: number;
  monthly_rent: number;
  monthly_debt_service: number;
  other_costs?: number;
}

export interface ChatRequest {
  message: string;
  wants_draft?: boolean;
  deal?: ChatDealFields;
}

export interface ChatResponse {
  answer: string | null;
  engine?: Record<string, unknown> | null;
  draft?: string | null;
  requires_approval?: boolean;
  mode?: string;
  note?: string;
  error?: string;
  grounding?: Record<string, unknown>;
}

export interface ConnectorsStatusResponse {
  connectors: Record<
    string,
    { connected: boolean; env_vars: string[] }
  >;
  connected_count: number;
  total: number;
}

export interface GhlCrmResponse {
  status: ConnectSourceStatus;
  sources: string[];
  new_leads?: number;
  missed_calls?: number;
  unread_texts?: number;
  pipeline?: unknown[];
}

export interface ClickUpIngestResult {
  ingested?: number;
  by_collection?: Record<string, number>;
  skipped_count?: number;
  duplicated?: number;
  records_fetched?: number;
  tasks_fetched?: number;
  synced_at?: number;
  skipped?: boolean;
  reason?: string;
  status?: string;
  sources?: string[];
}

export interface TrainCounts {
  voice: number;
  decisions: number;
  conversation_patterns: number;
  knowledge: number;
}

export interface ClickUpSyncStatus {
  configured: boolean;
  auto_sync: boolean;
  last_sync_at: number | null;
  last_result: ClickUpIngestResult | null;
}

export interface HealthMetricsResponse {
  status: ConnectSourceStatus;
  sources: string[];
  metrics?: Record<string, Record<string, unknown>>;
  note?: string;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${getBase()}${path}`);
  if (!res.ok) {
    throw new Error(`Brain API ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Brain API ${path}: ${res.status}${detail ? ` — ${detail}` : ''}`);
  }
  return res.json() as Promise<T>;
}

export const brain = {
  health: () => fetchJson<HealthResponse>('/health'),
  blindspots: () => fetchJson<ConnectSourceResponse>('/blindspots'),
  watchlist: () => fetchJson<ConnectSourceResponse>('/watchlist'),
  topMoves: (limit = 3) =>
    fetchJson<TopMoneyMovesResponse>(`/money/top-moves?limit=${limit}`),
  teamPulse: () => fetchJson<TeamPulseResponse>('/team/pulse'),
  dailyBrief: () => fetchJson<DailyBriefResponse>('/brief/daily'),
  decisionsHistory: (params?: { verdict?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.verdict) q.set('verdict', params.verdict);
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return fetchJson<DecisionsHistoryResponse>(
      `/decisions/history${qs ? `?${qs}` : ''}`,
    );
  },
  trainVoice: (text: string) => postJson<VoiceTrainResult>('/train/voice', { text }),
  trainDealDecision: (d: DealDecisionInput) =>
    postJson<DealDecisionResult>('/train/deal-decision', d),
  validationShadow: () => fetchJson<ShadowValidationResult>('/validation/shadow'),
  validationShadowBatch: (deals: Record<string, unknown>[]) =>
    postJson<ShadowValidationResult>('/validation/shadow', { deals }),
  chat: (req: ChatRequest) => postJson<ChatResponse>('/chat', req),
  connectorsStatus: () => fetchJson<ConnectorsStatusResponse>('/connectors/status'),
  ghlCrm: () => fetchJson<GhlCrmResponse>('/crm/ghl'),
  healthMetrics: () => fetchJson<HealthMetricsResponse>('/health/metrics'),
  weekAhead: () => fetchJson<ConnectSourceResponse>('/calendar/week'),
  trainCounts: () => fetchJson<TrainCounts>('/train/counts'),
  clickUpSyncStatus: () => fetchJson<ClickUpSyncStatus>('/ingest/clickup/status'),
  syncClickUp: () => postJson<ClickUpIngestResult>('/ingest/clickup', {}),
};

export function formatSourceLabel(sources: string[]): string {
  return sources
    .map((s) =>
      s
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    )
    .join(' · ');
}

export function isConnectSource(
  data: { status?: string } | null | undefined,
): boolean {
  return !data || data.status === 'connect_source';
}
