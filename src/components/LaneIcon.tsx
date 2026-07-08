type LaneVariant = 'crm' | 'tasks' | 'audio' | 'calendar';

interface LaneIconProps {
  variant: LaneVariant;
  className?: string;
}

const ICONS: Record<LaneVariant, string> = {
  crm: '◈',
  tasks: '◎',
  audio: '◇',
  calendar: '▣',
};

export function LaneIcon({ variant, className = '' }: LaneIconProps) {
  return (
    <span className={`lane-icon${className ? ` ${className}` : ''}`} aria-hidden="true">
      {ICONS[variant]}
    </span>
  );
}
