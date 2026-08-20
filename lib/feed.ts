import raw from '../data/command-center.sample.json';

export type CommandFeed = {
  meta: {
    kind: string;
    label: string;
    warning: string;
    timezone: string;
  };
  status: {
    watching: string;
  };
  inbound: {
    cards: { gate: string; label: string }[];
  };
  lock: {
    phone: { number: string; tel: string };
    apply: { label: string; href: string }[];
  };
};

export const glassFeed = raw as CommandFeed;
