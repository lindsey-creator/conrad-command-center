import { useCallback, useEffect, useState } from 'react';
import { brain } from './api/brain';
import { touchBrainLive } from './hooks/brainLive';
import { POLL_CONNECTORS_MS } from './hooks/brainPoll';
import { CommandHeader } from './components/CommandHeader';
import { Connections, resolveConnectorKey } from './components/Connections';
import { ConnectorsBar } from './components/ConnectorsBar';
import { EchoCommand } from './components/EchoCommand';
import { FeedTheBrain } from './components/FeedTheBrain';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ModuleGrid } from './components/ModuleGrid';
import { Nav, type Page } from './components/Nav';
import type { EchoVoiceState } from './hooks/useEchoVoice';
import './styles/tokens.css';
import './styles/layout.css';
import './styles/feed.css';

function pageFromHash(): Page {
  const id = window.location.hash.replace(/^#/, '').split('/')[0].toLowerCase();
  if (id === 'feed' || id === 'connections') return id;
  return 'dashboard';
}

export default function App() {
  const [page, setPageState] = useState<Page>(pageFromHash);
  const [connectFocus, setConnectFocus] = useState<string | null>(null);
  const [brainOnline, setBrainOnline] = useState(false);
  const [voiceState, setVoiceState] = useState<EchoVoiceState>('idle');

  const checkHealth = useCallback(async () => {
    try {
      const res = await brain.health();
      setBrainOnline(res.status === 'ok');
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

  return (
    <div className="wrap command-deck">
      <Header brainOnline={brainOnline} />
      <Nav page={page} onChange={setPage} />
      {page === 'dashboard' && (
        <ConnectorsBar onOpenConnections={() => openConnections()} />
      )}
      {page === 'dashboard' ? (
        <div className="command-deck__main">
          <EchoCommand onVoiceStateChange={setVoiceState} />
          <CommandHeader voiceState={voiceState} brainOnline={brainOnline} />
          <ModuleGrid onConnect={openConnections} />
        </div>
      ) : page === 'feed' ? (
        <FeedTheBrain />
      ) : (
        <Connections focusSource={connectFocus} />
      )}
      <Footer />
    </div>
  );
}
