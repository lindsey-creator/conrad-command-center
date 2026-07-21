export type DealHealth = 'green' | 'yellow' | 'red';

export interface FlywheelTouch {
  key: string;
  label: string;
  live: boolean;
}

export interface SeedDeal {
  id: string;
  name: string;
  address: string;
  vertical: string;
  entity: string;
  status: string;
  idleDays: number;
  health: DealHealth;
  flywheelRevenue: string;
  flywheel: FlywheelTouch[];
  note: string;
}

/** Master-spec seed deals — shown whenever Brain has no live deal feed yet. */
export const SEED_DEALS: SeedDeal[] = [
  {
    id: 'titus',
    name: 'Titus',
    address: '4-unit DSCR + modular ADU',
    vertical: 'DSCR · Modular',
    entity: 'Goldfront Capital',
    status: 'Underwrite',
    idleDays: 2,
    health: 'green',
    flywheelRevenue: '$1.2M+ flywheel',
    flywheel: [
      { key: 'hm', label: 'Hard money', live: true },
      { key: 'con', label: 'Construction', live: true },
      { key: 'title', label: 'Title', live: false },
      { key: 'ins', label: 'Insurance', live: false },
      { key: 'dscr', label: 'DSCR refi', live: true },
      { key: 'pm', label: 'PM', live: false },
    ],
    note: 'Modular ADU path — confirm Baker comps before margin lock.',
  },
  {
    id: 'bobby',
    name: 'Bobby',
    address: 'Non-QM refi · 8 doors',
    vertical: 'Non-QM',
    entity: 'Goldfront Capital',
    status: 'Docs out',
    idleDays: 5,
    health: 'yellow',
    flywheelRevenue: '$890K flywheel',
    flywheel: [
      { key: 'hm', label: 'Hard money', live: false },
      { key: 'con', label: 'Construction', live: false },
      { key: 'title', label: 'Title', live: true },
      { key: 'ins', label: 'Insurance', live: true },
      { key: 'dscr', label: 'DSCR refi', live: true },
      { key: 'pm', label: 'PM', live: true },
    ],
    note: 'Portfolio refi — idle 5d on investor stip sheet.',
  },
  {
    id: 'schill',
    name: 'Schill',
    address: 'QM purchase',
    vertical: 'Conrad Mortgage',
    entity: 'Conrad Mortgage',
    status: 'Processing',
    idleDays: 1,
    health: 'green',
    flywheelRevenue: '$420K touch',
    flywheel: [
      { key: 'hm', label: 'Hard money', live: false },
      { key: 'con', label: 'Construction', live: false },
      { key: 'title', label: 'Title', live: true },
      { key: 'ins', label: 'Insurance', live: true },
      { key: 'dscr', label: 'DSCR refi', live: false },
      { key: 'pm', label: 'PM', live: false },
    ],
    note: 'QM path clean — Emma owning conditions.',
  },
  {
    id: 'ridgeline',
    name: 'Ridgeline',
    address: '6-unit modular community',
    vertical: 'Modular · Community',
    entity: 'Goldfront Homes',
    status: 'Structuring',
    idleDays: 9,
    health: 'red',
    flywheelRevenue: '$2.4M+ flywheel',
    flywheel: [
      { key: 'hm', label: 'Hard money', live: true },
      { key: 'con', label: 'Construction', live: true },
      { key: 'title', label: 'Title', live: false },
      { key: 'ins', label: 'Insurance', live: false },
      { key: 'dscr', label: 'DSCR refi', live: false },
      { key: 'pm', label: 'PM', live: false },
    ],
    note: '9 idle days — Baker comps + modular band check before GO.',
  },
];

export const EMPIRE_UNITS = [
  { id: 'cm', label: 'Conrad Mortgage', tag: 'QM' },
  { id: 'gc', label: 'Goldfront Capital', tag: 'Non-QM · HM' },
  { id: 'gh', label: 'Goldfront Homes', tag: 'Modular' },
  { id: 'rh', label: 'Rhino Network', tag: 'Coaching' },
  { id: 'sd', label: 'Stone Donut', tag: 'AI / Ops' },
  { id: 'title', label: 'Title', tag: 'Partner' },
  { id: 'ins', label: 'Insurance', tag: 'Partner' },
  { id: 'pm', label: 'Property Mgmt', tag: 'Partner' },
] as const;
