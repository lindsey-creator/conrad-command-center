import { useCallback, useEffect, useState } from 'react';
import { brain } from './api/brain';
import { AskTheRoom } from './components/AskTheRoom';
import { Connections, resolveConnectorKey } from './components/Connections';
import { ConnectorsBar } from './components/ConnectorsBar';
import { FeedTheBrain } from './components/FeedTheBrain';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ModuleGrid } from './components/ModuleGrid';
import { Nav, type Page } from './components/Nav';
import './styles/tokens.css';
import './styles/layout.css';
import './styles/feed.css';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [connectFocus, setConnectFocus] = useState<string | null>(null);
  const [brainOnline, setBrainOnline] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const res = await brain.health();
      setBrainOnline(res.status === 'ok');
      setLastFetched(new Date());
    } catch {
      setBrainOnline(false);
    }
  }, []);

  useEffect(() => {
    void checkHealth();
    const interval = setInterval(() => void checkHealth(), 60_000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const openConnections = useCallback((source?: string) => {
    if (source) setConnectFocus(resolveConnectorKey(source));
    setPage('connections');
  }, []);

  return (
    <div className="wrap">
      <Header brainOnline={brainOnline} lastFetched={lastFetched} />
      <Nav page={page} onChange={setPage} />
      {page === 'dashboard' && (
        <ConnectorsBar onOpenConnections={() => openConnections()} />
      )}
      {page === 'dashboard' ? (
        <>
          <Hero />
          <AskTheRoom />
          <ModuleGrid onConnect={openConnections} />
        </>
      ) : page === 'feed' ? (
        <FeedTheBrain />
      ) : (
        <Connections focusSource={connectFocus} />
      )}
      <Footer />
    </div>
  );
}
