const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return rtf.format(0, 'minute');

  if (minutes < 60) return rtf.format(-minutes, 'minute');

  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');

  const days = Math.round(hours / 24);
  if (days < 30) return rtf.format(-days, 'day');

  const months = Math.round(days / 30);
  if (months < 12) return rtf.format(-months, 'month');

  const years = Math.round(days / 365);
  return rtf.format(-years, 'year');
}
