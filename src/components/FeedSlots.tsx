import { FeedGlass } from '../cockpit/FeedGlass';
import { useRhinoFeeds } from '../cockpit/useRhinoFeeds';

interface FeedSlotsProps {
  brainOnline?: boolean;
  onConnect?: (source: string) => void;
  onCommand?: (text: string) => void;
}

/** Rhino feed lock — Town pattern / GHL apply fills / Rise QM blockers / Non-QM milestones. */
export function FeedSlots({ brainOnline = false, onCommand }: FeedSlotsProps) {
  const feeds = useRhinoFeeds(brainOnline);
  return (
    <section className="feed-slots" aria-label="Rhino feeds">
      <FeedGlass feeds={feeds} onAsk={(command) => onCommand?.(command)} />
    </section>
  );
}
