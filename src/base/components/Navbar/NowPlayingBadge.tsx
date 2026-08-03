'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import useSWR from 'swr';

import { LastfmTrack } from '@/types/Lastfm';

type NowPlayingResponse = {
  nowPlaying: LastfmTrack | null;
};

const jsonFetcher = (url: string) => fetch(url).then((r) => r.json());

const NowPlayingArt = ({
  track,
  size,
  rounded = 'rounded',
}: {
  track: LastfmTrack;
  size: number;
  rounded?: string;
}) => {
  const [failed, setFailed] = useState(false);

  if (!track.imageUrl || failed) {
    return (
      <div
        aria-hidden="true"
        className={`shrink-0 bg-site-card-hover ${rounded}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Image
      src={track.imageUrl}
      alt=""
      width={size}
      height={size}
      unoptimized
      className={`shrink-0 object-cover ${rounded}`}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
};

const LiveDot = ({ className = '' }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`rounded-full bg-spotify motion-safe:animate-pulse ${className}`}
  />
);

type NowPlayingBadgeProps = {
  /** 'full' = capa + faixa + artista (desktop). 'compact' = só a capa (mobile). */
  variant: 'full' | 'compact';
};

/**
 * Selo "ouvindo agora" da navbar. Só renderiza algo quando há uma faixa
 * tocando no momento — sem música, o componente não ocupa espaço nenhum.
 */
export const NowPlayingBadge = ({ variant }: NowPlayingBadgeProps) => {
  const { data } = useSWR<NowPlayingResponse>(
    '/api/lastfm/now-playing',
    jsonFetcher,
    { revalidateOnFocus: false, refreshInterval: 60_000 },
  );
  const track = data?.nowPlaying;

  if (!track) return null;

  const href =
    track.imageSource === 'spotify' && track.spotifyUrl
      ? track.spotifyUrl
      : track.url;

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ouvindo agora: ${track.name}, ${track.artist}`}
        className="relative flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-primary"
      >
        <NowPlayingArt track={track} size={28} rounded="rounded-lg" />
        <LiveDot className="absolute -bottom-0.5 -right-0.5 size-2 ring-2 ring-site-background" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Ouvindo agora: ${track.name} — ${track.artist}`}
      className="flex items-center gap-2.5 rounded-full border border-site-border-subtle bg-site-card py-1.5 pl-1.5 pr-4 no-underline transition-colors hover:border-site-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-primary"
    >
      <NowPlayingArt track={track} size={36} rounded="rounded-xl" />
      <div className="min-w-0 leading-tight">
        <p className="m-0 max-w-[10rem] truncate text-sm font-semibold text-site-foreground">
          {track.name}
        </p>
        <p className="m-0 max-w-[10rem] truncate text-xs text-site-body-muted">
          {track.artist}
        </p>
      </div>
      <LiveDot className="size-2 shrink-0" />
    </Link>
  );
};
