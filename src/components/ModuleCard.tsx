import type { ReactNode } from 'react';

type PillVariant = 'crit' | 'warn' | 'go' | 'default' | 'stale';

interface ModuleCardProps {
  title: string;
  icon?: string;
  dotColor?: string;
  pill?: string;
  pillVariant?: PillVariant;
  span2?: boolean;
  loading?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

export function ModuleCard({
  title,
  icon,
  dotColor,
  pill,
  pillVariant = 'default',
  span2,
  loading,
  children,
  footer,
}: ModuleCardProps) {
  return (
    <div className={`card${span2 ? ' span2' : ''}`}>
      <div className="h">
        <div className="t">
          {dotColor && (
            <span className="dot" style={{ background: dotColor }} />
          )}
          {icon && !dotColor && <span>{icon}</span>}
          {title}
        </div>
        {pill && (
          <span className={`pill${pillVariant !== 'default' ? ` ${pillVariant}` : ''}`}>
            {pill}
          </span>
        )}
      </div>
      {loading ? (
        <div className="body">
          <div className="skeleton" style={{ width: '80%' }} />
          <div className="skeleton" style={{ width: '60%', marginTop: 8 }} />
        </div>
      ) : (
        children
      )}
      {footer}
    </div>
  );
}
