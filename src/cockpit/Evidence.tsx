interface EvidenceProps {
  proven: boolean;
}

/** PROVEN = Brain live payload. CLAIMED = offline, connect_source, or not yet wired. */
export function Evidence({ proven }: EvidenceProps) {
  return (
    <span className={`evidence evidence--${proven ? 'proven' : 'claimed'}`}>
      {proven ? 'PROVEN' : 'CLAIMED'}
    </span>
  );
}
