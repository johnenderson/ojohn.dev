/** Ponto pulsante "ao vivo" — usado no selo "ouvindo agora" da navbar e em listas de faixas. */
export const LiveDot = ({ className = '' }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`rounded-full bg-spotify motion-safe:animate-pulse ${className}`}
  />
);
