import { useState, type ReactNode } from 'react';

type BadgeVariant = 'default' | 'warn' | 'live';

interface IntelLaneProps {
  variant: 'crm' | 'tasks' | 'audio' | 'calendar';
  title: string;
  subtitle: string;
  badge?: number | string | null;
  badgeVariant?: BadgeVariant;
  defaultOpen?: boolean;
  children: ReactNode;
}

function IntelLane({
  variant,
  title,
  subtitle,
  badge,
  badgeVariant = 'default',
  defaultOpen = true,
  children,
}: IntelLaneProps) {
  const [open, setOpen] = useState(defaultOpen);
  const badgeClass =
    badgeVariant === 'warn'
      ? ' intel-lane__badge--warn'
      : badgeVariant === 'live'
        ? ' intel-lane__badge--live'
        : '';

  return (
    <section
      className={`intel-lane${open ? '' : ' intel-lane--collapsed'}`}
      aria-label={title}
    >
      <button
        type="button"
        className="intel-lane__head intel-lane__head--toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={`lane-icon-dot lane-icon-dot--${variant}`} aria-hidden="true" />
        <h4 className="intel-lane__title">{title}</h4>
        {badge != null && badge !== '' && (
          <span className={`intel-lane__badge${badgeClass}`}>{badge}</span>
        )}
        <span className="intel-lane__count">{subtitle}</span>
        <span className="intel-lane__chevron" aria-hidden="true">
          ▼
        </span>
      </button>
      <div className="intel-lane__body">{children}</div>
    </section>
  );
}

export { IntelLane };
