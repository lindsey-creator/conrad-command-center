import raw from '../data/command-center.json';

export type CalendarBlock = {
  start: string;
  end: string;
  title: string;
  detail: string | null;
  where: string | null;
  href: string | null;
  who: string | null;
  brief?: string | null;
};

export type InboundCard = {
  gate: string;
  label: string;
  title: string | null;
  detail: string | null;
  href: string | null;
};

export type CommandFeed = {
  meta: {
    kind: string;
    label: string;
    source: string;
    as_of: string;
    timezone: string;
    warning: string;
  };
  status: {
    watching: string;
  };
  town: {
    brief: string | null;
  };
  calendar: {
    date: string;
    blocks: CalendarBlock[];
  };
  inbound: {
    cards: InboundCard[];
  };
  go: {
    apply: { label: string; href: string }[];
  };
};

export const glassFeed = raw as CommandFeed;
