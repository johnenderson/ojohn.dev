const getInitials = (label: string) =>
  label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

export const MusicFallback = ({ label }: { label: string }) => (
  <div className="relative flex size-full items-center justify-center overflow-hidden bg-site-card-hover text-center font-bold uppercase text-site-primary">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,var(--site-primary-soft),transparent_42%),linear-gradient(135deg,var(--site-card),var(--site-card-hover))]" />
    <span className="relative text-2xl tracking-[0.08em]">
      {getInitials(label)}
    </span>
  </div>
);

export const ArtistFallback = ({ label }: { label: string }) => (
  <div className="relative flex size-full items-center justify-center overflow-hidden bg-site-card-hover text-center font-bold uppercase text-site-primary">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,var(--site-primary-soft),transparent_36%),linear-gradient(145deg,var(--site-card-hover),var(--site-card))]" />
    <span className="relative flex size-12 items-center justify-center rounded-full border border-site-primary/40 bg-site-background/55 text-lg tracking-[0.08em] shadow-sm">
      {getInitials(label)}
    </span>
  </div>
);
