'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CSSProperties, ReactNode, useEffect, useState } from 'react';

import { Card } from '@/base/components/Card';
import { LastfmStats, LastfmTrack } from '@/types/Lastfm';

type LastfmNowPlayingResponse = {
  nowPlaying: LastfmTrack | null;
};

const MusicIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const DiscIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="2" />
    <path d="M7 12a5 5 0 0 1 5-5" />
    <path d="M17 12a5 5 0 0 1-5 5" />
  </svg>
);

const LiveBadge = () => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-site-border bg-site-primary-soft px-2 py-0.5 text-xs font-semibold leading-5 text-site-primary-hover">
    <span className="h-1.5 w-1.5 rounded-full bg-site-primary-hover motion-safe:animate-pulse" />{' '}
    ao vivo
  </span>
);

const FadeIn = ({
  children,
  className,
  delay = 0,
  duration = 300,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) => (
  <div
    className={['site-fade-in', className].filter(Boolean).join(' ')}
    style={
      {
        '--fade-in-delay': `${delay}ms`,
        '--fade-in-duration': `${duration}ms`,
      } as CSSProperties
    }
  >
    {children}
  </div>
);

const TrackArtwork = ({
  eager = false,
  track,
  size = 64,
}: {
  eager?: boolean;
  track: LastfmTrack;
  size?: number;
}) => {
  const [failed, setFailed] = useState(false);

  if (!track.imageUrl || failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded bg-site-card-hover text-site-body-muted"
        style={{ width: size, height: size }}
      >
        <MusicIcon size={Math.max(16, size / 2.5)} />
      </div>
    );
  }

  return (
    <Image
      src={track.imageUrl}
      alt={track.album ?? track.name}
      width={size}
      height={size}
      loading={eager ? 'eager' : 'lazy'}
      priority={eager}
      unoptimized
      className="shrink-0 rounded transition-transform duration-200 group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
};

const TrackRow = ({ track }: { track: LastfmTrack }) => (
  <li className="interactive-row group flex min-w-0 items-center gap-3 rounded p-1">
    <TrackArtwork track={track} size={40} />
    <div className="flex min-w-0 flex-col">
      <Link
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-sm font-medium no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
        title={track.name}
      >
        {track.name}
      </Link>
      <p className="m-0 truncate text-xs text-site-body-muted">
        {track.artist}
      </p>
    </div>
  </li>
);

export const LastfmCard = () => {
  const [lastfm, setLastfm] = useState<LastfmStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetch('/api/lastfm/now-playing', { cache: 'no-store' }).then(
        (response) => response.json() as Promise<LastfmNowPlayingResponse>,
      ),
      fetch('/api/lastfm/recent', { cache: 'no-store' }).then(
        (response) => response.json() as Promise<LastfmStats>,
      ),
    ])
      .then(([nowPlayingResult, recentResult]) => {
        if (!active) return;

        const nowPlaying =
          nowPlayingResult.status === 'fulfilled'
            ? nowPlayingResult.value.nowPlaying
            : null;
        const recent =
          recentResult.status === 'fulfilled'
            ? recentResult.value
            : { nowPlaying: null, lastPlayed: null, tracks: [] };

        setLastfm({
          ...recent,
          nowPlaying,
        });
      })
      .catch(() => {
        if (active) {
          setLastfm({ nowPlaying: null, lastPlayed: null, tracks: [] });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const featuredTrack = lastfm?.nowPlaying ?? lastfm?.lastPlayed ?? null;
  const title = lastfm?.nowPlaying ? 'Ouvindo agora' : 'Última música';

  return (
    <section id="activity" className="mt-12 md:mt-14">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <FadeIn className="col-span-1 md:col-span-2" duration={500}>
          <Card interactive className="flex h-full flex-col gap-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="m-0 text-base font-semibold text-site-foreground">
                  {title}
                </h2>
                <DiscIcon />
              </div>
              {lastfm?.nowPlaying && <LiveBadge />}
            </div>

            {loading && (
              <div className="h-16 w-full animate-pulse rounded bg-site-card-hover" />
            )}

            {!loading && featuredTrack && (
              <>
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <TrackArtwork eager track={featuredTrack} size={96} />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Link
                      href={featuredTrack.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-lg font-bold no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
                      title={featuredTrack.name}
                    >
                      {featuredTrack.name}
                    </Link>
                    {featuredTrack.album && (
                      <p className="m-0 truncate text-sm text-site-body">
                        {featuredTrack.album}
                      </p>
                    )}
                    <p className="m-0 truncate text-sm text-site-body-muted">
                      {featuredTrack.artist}
                    </p>
                  </div>
                </div>
                <Link
                  href={featuredTrack.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit text-xs font-medium text-site-body-muted no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
                >
                  Ver no Last.fm
                </Link>
              </>
            )}

            {!loading && !featuredTrack && (
              <p className="m-0 text-sm text-site-body-muted">
                Nenhuma música recente encontrada.
              </p>
            )}
          </Card>
        </FadeIn>

        <FadeIn className="col-span-1 md:col-span-2" delay={100} duration={500}>
          <Card
            interactive
            className="flex h-full min-h-36 flex-col gap-4 p-4 sm:p-5"
          >
            <div className="flex items-center gap-2">
              <h2 className="m-0 text-base font-semibold text-site-foreground">
                Últimas faixas
              </h2>
              <MusicIcon />
            </div>

            {loading && (
              <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-10 animate-pulse rounded bg-site-card-hover"
                  />
                ))}
              </div>
            )}

            {!loading && lastfm && lastfm.tracks.length > 0 && (
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {lastfm.tracks.slice(0, 4).map((track, index) => (
                  <TrackRow
                    key={`${track.name}-${track.artist}-${
                      track.playedAt ?? track.url
                    }-${index}`}
                    track={track}
                  />
                ))}
              </ul>
            )}

            {!loading && (!lastfm || lastfm.tracks.length === 0) && (
              <p className="m-0 text-sm text-site-body-muted">
                Sem histórico recente para mostrar.
              </p>
            )}
          </Card>
        </FadeIn>
      </div>
    </section>
  );
};
