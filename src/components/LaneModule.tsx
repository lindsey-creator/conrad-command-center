import { useState, type ReactNode } from 'react';

type PillVariant = 'crit' | 'warn' | 'go' | 'default';

interface LaneModuleProps {
  title: string;
  icon?: string;
  pill?: string;
  pillVariant?: PillVariant;
  defaultOpen?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function LaneModule({
  title,
  icon,
  pill,
  pillVariant = 'default',
  defaultOpen = true,
  loading,
  children,
}: LaneModuleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`lane-module${open ? ' lane-module--open' : ''}`}>
      <button
        type="button"
        className="lane-module__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="lane-module__toggle-left">
          {icon && <span className="lane-module__icon" aria-hidden="true">{icon}</span>}
          <span className="lane-module__name">{title}</span>
        </span>
        <span className="lane-module__meta">
          {pill && (
            <span className={`pill${pillVariant !== 'default' ? ` ${pillVariant}` : ''}`}>
              {pill}
            </span>
          )}
          <span className="lane-module__chevron" aria-hidden="true">▼</span>
        </span>
      </button>
      {open && (
        <div className="lane-module__content">
          {loading ? (
            <>
              <div className="skeleton" style={{ width: '80%' }} />
              <div className="skeleton" style={{ width: '60%', marginTop: 8 }} />
            </>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}
