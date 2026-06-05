export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours}h`;

  const days = Math.round(hours / 24);
  if (days < 30) return `há ${days}d`;

  const months = Math.round(days / 30);
  if (months < 12) return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;

  const years = Math.round(days / 365);
  return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}
