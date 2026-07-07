export interface ListItem {
  title?: string;
  detail?: string;
  source?: string;
  [key: string]: unknown;
}

export function itemLabel(item: unknown): string {
  if (item == null) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    const o = item as ListItem;
    if (o.title && o.detail) return `${o.title} — ${o.detail}`;
    if (o.title) return String(o.title);
    if (o.detail) return String(o.detail);
  }
  return String(item);
}

export function hasLiveData(
  data: { status?: string } | null | undefined,
): boolean {
  return !!data && data.status !== 'connect_source';
}

export function itemTime(item: unknown): string | null {
  if (item == null || typeof item !== 'object') return null;
  const o = item as ListItem & { time?: string; date?: string; start?: string };
  const raw = o.time ?? o.start ?? o.date;
  if (!raw) return null;
  if (/^\d{1,2}:\d{2}/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return String(raw).slice(0, 12);
}

export type LaneRowSeverity = 'default' | 'go' | 'warn' | 'crit';

export function itemSeverity(item: unknown): LaneRowSeverity {
  if (item == null || typeof item !== 'object') return 'default';
  const o = item as ListItem & { days_late?: number; severity?: string };
  if (typeof o.days_late === 'number' && o.days_late > 0) {
    return o.days_late >= 7 ? 'crit' : 'warn';
  }
  const text = `${o.title ?? ''} ${o.detail ?? ''}`.toLowerCase();
  if (text.includes('overdue') || text.includes('late') || text.includes('d late')) {
    return 'warn';
  }
  if (o.severity === 'crit' || o.severity === 'critical') return 'crit';
  if (o.severity === 'warn' || o.severity === 'watch') return 'warn';
  if (o.severity === 'go' || o.severity === 'ok') return 'go';
  return 'default';
}
