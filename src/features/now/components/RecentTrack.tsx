import Image from 'next/image';
import Link from 'next/link';

import { LiveDot } from '@/base/components/LiveDot';
import { MusicFallback } from '@/features/now/components/MusicFallback';
import { LastfmTrack } from '@/types/Lastfm';

/** "23:35" se foi hoje, "26/08 23:35" caso contrário. */
const formatPlayedAt = (playedAt: string) => {
  const date = new Date(playedAt);
  const time = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (date.toDateString() === new Date().toDateString()) return time;

  const day = date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'numeric',
  });
  return `${day} ${time}`;
};

const TrackArtwork = ({
  track,
  priority = false,
}: {
  track: LastfmTrack;
  priority?: boolean;
}) => (
  <div className="relative size-14 shrink-0 overflow-hidden rounded bg-site-card-hover">
    {track.imageUrl ? (
      <Image
        src={track.imageUrl}
        alt={track.album ?? track.name}
        fill
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        unoptimized
        sizes="56px"
        className="object-cover"
      />
    ) : (
      <MusicFallback label={track.name} />
    )}
  </div>
);

export const RecentTrack = ({
  track,
  priority = false,
}: {
  track: LastfmTrack;
  priority?: boolean;
}) => (
  <li>
    <Link
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="interactive-row group flex items-center gap-3 rounded-md p-2 no-underline"
    >
      <TrackArtwork track={track} priority={priority} />
      <div className="min-w-0">
        <p className="m-0 truncate font-bold leading-5 text-site-foreground transition-colors group-hover:text-site-primary-hover">
          {track.name}
        </p>
        <p className="m-0 truncate text-sm leading-5 text-site-body-muted">
          {track.artist}
        </p>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-site-body-muted">
        {track.nowPlaying ? (
          <>
            <span className="hidden sm:inline">Ouvindo agora</span>
            <LiveDot className="size-2" />
          </>
        ) : track.playedAt ? (
          <span>{formatPlayedAt(track.playedAt)}</span>
        ) : null}
      </div>
    </Link>
  </li>
);
