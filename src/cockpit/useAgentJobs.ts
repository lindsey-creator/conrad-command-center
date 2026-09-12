import { useCallback, useMemo } from 'react';
import { brain } from '../api/brain';
import { POLL_FAST_MS, POLL_MODULE_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData } from '../utils/renderItems';
import { TOP7, type JobId } from './readyAgent';
import type { Type1Lock } from './useType1Locks';

export interface JobChip {
  id: JobId;
  tag: string;
  hold: string;
  proven: boolean;
}

/** Live PROVEN/CLAIMED for the top-7 jobs. Never invent a live chip. */
export function useAgentJobs(brainOnline: boolean, locks: Type1Lock[]): JobChip[] {
  const fetchBrief = useCallback(() => brain.dailyBrief(), []);
  const fetchGhl = useCallback(() => brain.ghlCrm(), []);
  const fetchWatch = useCallback(() => brain.watchlist(), []);
  const fetchPulse = useCallback(() => brain.teamPulse(), []);
  const fetchWeek = useCallback(() => brain.weekAhead(), []);
  const fetchPlaud = useCallback(() => brain.audioRecent(8), []);

  const brief = useBrainQuery('job-brief', fetchBrief, { refreshMs: POLL_MODULE_MS });
  const ghl = useBrainQuery('job-ghl', fetchGhl, { refreshMs: POLL_FAST_MS, staggerMs: 120 });
  const watch = useBrainQuery('job-watch', fetchWatch, { refreshMs: POLL_FAST_MS, staggerMs: 180 });
  const pulse = useBrainQuery('job-pulse', fetchPulse, { refreshMs: POLL_FAST_MS, staggerMs: 240 });
  const week = useBrainQuery('job-week', fetchWeek, { refreshMs: POLL_MODULE_MS, staggerMs: 280 });
  const plaud = useBrainQuery('job-plaud', fetchPlaud, { refreshMs: POLL_MODULE_MS, staggerMs: 320 });

  return useMemo(() => {
    const sched = hasLiveData(brief.data?.today_schedule) && (brief.data?.today_schedule.items?.length ?? 0) > 0;
    const weekLive = hasLiveData(week.data) && (week.data?.items?.length ?? 0) > 0;
    const leakLive =
      (hasLiveData(watch.data) && (watch.data?.items?.length ?? 0) > 0) ||
      (hasLiveData(pulse.data) && (pulse.data?.overdue?.length ?? 0) > 0);
    const ghlLive = brainOnline && hasLiveData(ghl.data);
    const briefLive = brainOnline && hasLiveData(brief.data);
    const plaudLive = brainOnline && hasLiveData(plaud.data) && (plaud.data?.items?.length ?? 0) > 0;
    const type1Live = locks.some((row) => row.proven);

    const proven: Record<JobId, boolean> = {
      brief: Boolean(briefLive),
      apply: Boolean(ghlLive),
      leak: Boolean(brainOnline && leakLive),
      meet: Boolean(brainOnline && (sched || weekLive)),
      plaud: Boolean(plaudLive),
      type1: type1Live,
      rhino: false,
    };

    return TOP7.map((job) => ({
      ...job,
      proven: proven[job.id],
    }));
  }, [brainOnline, brief.data, ghl.data, watch.data, pulse.data, week.data, plaud.data, locks]);
}
