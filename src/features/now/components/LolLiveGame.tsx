import Image from 'next/image';

import type { LolLiveGame as LolLiveGameType } from '@/lib/lol';

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

type LolLiveGameProps = {
  game: LolLiveGameType;
};

export function LolLiveGame({ game }: Readonly<LolLiveGameProps>) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-site-primary/30 bg-site-primary-soft px-4 py-3">
      <Image
        src={game.championIconUrl}
        alt={game.championId}
        width={44}
        height={44}
        unoptimized
        className="shrink-0 rounded"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-site-primary">
            <span className="size-2 animate-pulse rounded-full bg-site-primary" />
            Em jogo agora
          </span>
          <span className="text-xs text-site-body-muted">{game.gameMode}</span>
        </div>
        <p className="m-0 mt-0.5 text-xs text-site-body-muted">
          {game.championId} · {formatDuration(game.gameLengthSeconds)}
        </p>
      </div>
    </div>
  );
}
