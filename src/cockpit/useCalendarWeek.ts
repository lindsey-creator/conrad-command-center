import { useCallback, useMemo } from 'react';
import { brain, type ConnectSourceResponse } from '../api/brain';
import { POLL_MODULE_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { itemLabel } from '../utils/renderItems';

export interface CalendarEvent {
  title: string;
  when: string;
}

export interface CalendarWeek {
  status: string;
  proven: boolean;
  events: CalendarEvent[];
}

function readEvent(item: unknown): CalendarEvent | null {
  if (item == null) return null;
  if (typeof item === 'string') {
    const title = item.trim();
    return title ? { title, when: '' } : null;
  }
  if (typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;
  const title = itemLabel(item).trim();
  if (!title) return null;
  const when = [o.start, o.when, o.time, o.detail]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .find(Boolean) ?? '';
  return { title, when };
}

export function emptyCalendar(status = 'connect_source'): CalendarWeek {
  return { status, proven: false, events: [] };
}

export function parseCalendarWeek(data: ConnectSourceResponse | null | undefined): CalendarWeek {
  if (!data) return emptyCalendar();
  const status = String(data.status ?? 'connect_source');
  const events = (data.items ?? []).map(readEvent).filter((e): e is CalendarEvent => Boolean(e));
  const proven = status !== 'connect_source' && events.length > 0;
  return { status, proven, events: events.slice(0, 6) };
}

export function useCalendarWeek(brainOnline: boolean): CalendarWeek {
  const fetchWeek = useCallback(() => brain.weekAhead(), []);
  const week = useBrainQuery('calendar-week', fetchWeek, { refreshMs: POLL_MODULE_MS });
  return useMemo(() => {
    if (!brainOnline) return emptyCalendar('offline');
    return parseCalendarWeek(week.data);
  }, [brainOnline, week.data]);
}
