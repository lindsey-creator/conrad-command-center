import { Hud } from '@/components/hud/Hud';
import { clevelandClock } from '@/lib/cleveland';
import { glassFeed } from '@/lib/feed';

export default function Page() {
  const clock = clevelandClock();
  return <Hud feed={glassFeed} initialClock={clock} />;
}
