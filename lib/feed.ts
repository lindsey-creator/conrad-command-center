import raw from '../data/command-center.sample.json';

export type FeedMark = 'SAMPLE' | 'EXAMPLE' | 'LOCK' | 'LIVE';

export type CalendarBlock = {
  start: string;
  end: string;
  title: string;
};

export type InboundCard = {
  gate: string;
  title: string;
  detail: string;
  mark: FeedMark;
};

export type CommandFeed = {
  meta: {
    kind: string;
    label: string;
    warning: string;
    timezone: string;
    city: string;
  };
  operator: {
    name: string;
    role: string;
    entities: string[];
  };
  status: {
    source: string;
    watching: string;
  };
  today: {
    source: string;
    note: string;
    weekday: string;
    blocks: CalendarBlock[];
  };
  inbound: {
    source: string;
    note: string;
    gates: string[];
    cards: InboundCard[];
  };
  whoopSample: {
    recovery: number;
    strain: number;
    sleep: number;
    label: string;
  };
  lock: {
    source: string;
    phones: {
      lindsey: { label: string; number: string; tel: string; note: string };
      listing: { label: string; number: string; note: string; owner: string };
      dead: { label: string; number: string; note: string };
    };
    apply: { label: string; href: string }[];
  };
};

export const sampleFeed = raw as CommandFeed;
