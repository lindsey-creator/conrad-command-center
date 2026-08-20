import { Hud } from '@/components/hud/Hud';
import { clevelandClock } from '@/lib/cleveland';
import { sampleFeed } from '@/lib/feed';

export const dynamic = 'force-dynamic';

export default function Page() {
  const clock = clevelandClock();
  return <Hud feed={sampleFeed} initialClock={clock} />;
}
