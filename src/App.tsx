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

function pageFromHash(): Page {
  const id = window.location.hash.replace(/^#/, '').split('/')[0].toLowerCase();
  if (id === 'feed' || id === 'connections') return id;
  return 'dashboard';
}

export default function App() {
  const [page, setPageState] = useState<Page>(pageFromHash);
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
