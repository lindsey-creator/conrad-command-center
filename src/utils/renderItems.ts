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
