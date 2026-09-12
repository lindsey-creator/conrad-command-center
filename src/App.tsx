import { useCallback, useEffect, useState } from 'react';
import { brain } from './api/brain';
import { touchBrainLive } from './hooks/brainLive';
import { POLL_CONNECTORS_MS } from './hooks/brainPoll';
import { CommandHeader } from './components/CommandHeader';
import { Type1Decisions } from './components/Type1Decisions';
import { FeedSlots } from './components/FeedSlots';
import { Connections, resolveConnectorKey } from './components/Connections';
import { EchoCommand } from './components/EchoCommand';
import { FeedTheBrain } from './components/FeedTheBrain';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ModuleGrid } from './components/ModuleGrid';
import { Nav, type Page } from './components/Nav';
import { PendingApprovals } from './components/PendingApprovals';
import type { EchoVoiceState } from './hooks/useEchoVoice';
import './styles/tokens.css';
import './styles/layout.css';
import './styles/feed.css';
import './styles/hud.css';

function pageFromHash(): Page {
  const id = window.location.hash.replace(/^#/, '').split('/')[0].toLowerCase();
  if (id === 'echo' || id === 'feed' || id === 'train') return 'echo';
  if (id === 'connections' || id === 'stack') return 'connections';
  return 'dashboard';
}

export default function App() {
  const [page, setPageState] = useState<Page>(pageFromHash);
  const [connectFocus, setConnectFocus] = useState<string | null>(null);
  const [brainOnline, setBrainOnline] = useState(false);
  const [voiceState, setVoiceState] = useState<EchoVoiceState>('idle');
  const [pendingCommand, setPendingCommand] = useState<string | undefined>();
  const [seedNonce, setSeedNonce] = useState(0);

  const checkHealth = useCallback(async () => {
    try {
      const healthRes = await brain.health();
      setBrainOnline(healthRes.status === 'ok');
      touchBrainLive();
    } catch {
      setBrainOnline(false);
    }
  }, []);

  useEffect(() => {
    void checkHealth();
    const interval = setInterval(() => void checkHealth(), POLL_CONNECTORS_MS);
    return () => clearInterval(interval);
  }, [checkHealth]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void checkHealth();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [checkHealth]);

  const setPage = useCallback((next: Page) => {
    setPageState(next);
    const hash = next === 'dashboard' ? '' : `#${next}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}${hash}`,
      );
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => setPageState(pageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const openConnections = useCallback((source?: string) => {
    if (source) setConnectFocus(resolveConnectorKey(source));
    setPage('connections');
  }, [setPage]);

  const runThroughGlass = useCallback((text: string) => {
    setPage('dashboard');
    setPendingCommand(text);
    setSeedNonce((n) => n + 1);
    window.requestAnimationFrame(() => {
      document.getElementById('jarvis-command-input')?.focus();
      document.querySelector('.echo-command')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [setPage]);

  return (
    <div className="wrap command-deck hud-root">
      <div className="hud-atmosphere" aria-hidden="true">
        <div className="hud-atmosphere__ring" />
        <div className="hud-atmosphere__sweep" />
        <div className="hud-atmosphere__vignette" />
      </div>
      <Header brainOnline={brainOnline} />
      <Nav page={page} onChange={setPage} />
      {page === 'dashboard' ? (
        <div className="command-deck__main">
          <CommandHeader voiceState={voiceState} brainOnline={brainOnline} />
          <EchoCommand
            key={seedNonce}
            brainOnline={brainOnline}
            onVoiceStateChange={setVoiceState}
            commandSeed={pendingCommand}
          />
          <Type1Decisions
            brainOnline={brainOnline}
            onConnect={openConnections}
            onCommand={runThroughGlass}
          />
          <FeedSlots
            brainOnline={brainOnline}
            onConnect={openConnections}
            onCommand={runThroughGlass}
          />
          <PendingApprovals />
          <details className="intel-fold hud-corners">
            <summary>Expand full intel deck</summary>
            <div className="intel-fold__body">
              <ModuleGrid onConnect={openConnections} />
            </div>
          </details>
        </div>
      ) : page === 'echo' ? (
        <FeedTheBrain />
      ) : (
        <Connections focusSource={connectFocus} />
      )}
      <Footer />
    </div>
  );
}
