import Image from 'next/image';

import type { LolMatch } from '@/lib/lol';
import { QUEUE_LABELS } from '@/lib/lol';

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatPlayedAt = (ts: number) => {
  const diffMs = Date.now() - ts;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.round(hours / 24);
  return `há ${days}d`;
};

type LolMatchHistoryProps = {
  matches: LolMatch[];
};

export function LolMatchHistory({ matches }: Readonly<LolMatchHistoryProps>) {
  if (matches.length === 0) return null;

  return (
    <div>
      <h4 className="mb-3 text-base font-bold text-site-foreground">
        Últimas partidas
      </h4>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {matches.map((match, index) => (
          <li
            key={match.matchId}
            className={`flex items-center gap-3 rounded-md border px-3 py-2 ${
              match.win
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-red-500/20 bg-red-500/5'
            }`}
          >
            <Image
              src={match.championIconUrl}
              alt={match.championId}
              width={36}
              height={36}
              unoptimized
              priority={index === 0}
              className="shrink-0 rounded"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span
                  className={`text-xs font-bold ${
                    match.win ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {match.win ? 'Vitória' : 'Derrota'}
                </span>
                <span className="text-xs text-site-body-muted">
                  {match.championId}
                </span>
                <span className="text-xs text-site-border">·</span>
                <span className="text-xs text-site-body-muted">
                  {QUEUE_LABELS[match.queueId] ?? 'Partida'}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-site-body-muted">
                <span className="font-semibold text-site-foreground">
                  {match.kills}/{match.deaths}/{match.assists}
                </span>
                <span className="text-site-border">·</span>
                <span>{formatDuration(match.durationSeconds)}</span>
                <span className="text-site-border">·</span>
                <span>{formatPlayedAt(match.playedAt)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
