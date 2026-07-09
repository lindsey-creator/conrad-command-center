import { useState } from 'react';
import { brain, type ClickUpIngestResult } from '../api/brain';
import { dispatchBrainRefresh } from '../hooks/brainRefresh';
import './quick-run-strip.css';

type FlashKind = 'ok' | 'err' | null;

interface QuickRunStripProps {
  clickupConnected?: boolean;
}

export function QuickRunStrip({ clickupConnected = false }: QuickRunStripProps) {
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [flash, setFlash] = useState<FlashKind>(null);
  const [flashMsg, setFlashMsg] = useState<string | null>(null);

  const showFlash = (kind: FlashKind, msg: string) => {
    setFlash(kind);
    setFlashMsg(msg);
    window.setTimeout(() => {
      setFlash(null);
      setFlashMsg(null);
    }, 4000);
  };

  const syncClickUp = async () => {
    setSyncing(true);
    try {
      const res: ClickUpIngestResult = await brain.syncClickUp();
      if (res.status === 'connect_source') {
        showFlash('err', 'ClickUp not connected');
        return;
      }
      showFlash(
        'ok',
        `Synced ${res.ingested ?? 0} items (${res.records_fetched ?? '—'} records)`,
      );
      dispatchBrainRefresh();
    } catch (e) {
      showFlash('err', e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const refreshAll = () => {
    setRefreshing(true);
    dispatchBrainRefresh();
    showFlash('ok', 'Refreshing all lanes…');
    window.setTimeout(() => setRefreshing(false), 600);
  };

  const openStack = () => {
    window.location.hash = 'connections';
  };

  return (
    <div className="quick-run-strip" role="toolbar" aria-label="Quick run actions">
      <span className="quick-run-strip__label">RUN</span>
      <button
        type="button"
        className="quick-run-btn quick-run-btn--gold"
        disabled={syncing || !clickupConnected}
        onClick={() => void syncClickUp()}
        title={clickupConnected ? 'Pull ClickUp into Brain' : 'Connect ClickUp first'}
      >
        {syncing ? 'Syncing…' : 'Sync ClickUp'}
      </button>
      <button
        type="button"
        className="quick-run-btn"
        disabled={refreshing}
        onClick={refreshAll}
      >
        {refreshing ? 'Refreshing…' : 'Refresh all'}
      </button>
      <button type="button" className="quick-run-btn" onClick={openStack}>
        Open Stack
      </button>
      {flash && flashMsg && (
        <span
          className={`quick-run-flash quick-run-flash--${flash}`}
          role="status"
          aria-live="polite"
        >
          {flashMsg}
        </span>
      )}
      <span className="quick-run-strip__rule">
        New ClickUp tasks → Lindsey for review
      </span>
    </div>
  );
}
