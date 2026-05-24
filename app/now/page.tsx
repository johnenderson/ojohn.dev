import Image from 'next/image';
import Link from 'next/link';

import { PageWrapper } from '../components/PageWrapper';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Metadata } from 'next';

import { getLastfmRecentStats, getLastfmTopArtists } from '@/lib/lastfm';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { LastfmArtist, LastfmTrack } from '@/types/Lastfm';

const NOW_TITLE = 'Agora';
const NOW_DESCRIPTION =
  'Sou um músico enferrujado, que continua amando a música.';
const NOW_URL = `${SITE_URL}/now`;
const NOW_OG_IMAGE = `${SITE_URL}/og/site/now`;

export const revalidate = 3600;

export const metadata: Metadata = {
  title: NOW_TITLE,
  description: NOW_DESCRIPTION,
  alternates: {
    canonical: NOW_URL,
  },
  openGraph: {
    title: NOW_TITLE,
    description: NOW_DESCRIPTION,
    images: [{ url: NOW_OG_IMAGE, width: 1200, height: 630 }],
    siteName: SITE_NAME,
    type: 'website',
    url: NOW_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: NOW_TITLE,
    description: NOW_DESCRIPTION,
    images: [NOW_OG_IMAGE],
  },
};

const HeadphonesIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="size-7"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M3 14a9 9 0 0 1 18 0" />
    <path d="M3 14v4a2 2 0 0 0 2 2h2v-8H5a2 2 0 0 0-2 2Z" />
    <path d="M21 14v4a2 2 0 0 1-2 2h-2v-8h2a2 2 0 0 1 2 2Z" />
  </svg>
);

const MusicFallback = ({ label }: { label: string }) => (
  <div className="relative flex size-full items-center justify-center overflow-hidden bg-site-card-hover text-center font-bold uppercase text-site-primary">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,var(--site-primary-soft),transparent_42%),linear-gradient(135deg,var(--site-card),var(--site-card-hover))]" />
    <span className="relative text-2xl tracking-[0.08em]">
      {label.slice(0, 2)}
    </span>
  </div>
);

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
        sizes="56px"
        className="object-cover"
      />
    ) : (
      <MusicFallback label={track.name} />
    )}
  </div>
);

const RecentTrack = ({
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
    </Link>
  </li>
);

const ArtistCard = ({ artist }: { artist: LastfmArtist }) => (
  <Link
    href={
      artist.imageSource === 'spotify' && artist.spotifyUrl
        ? artist.spotifyUrl
        : artist.url
    }
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`${artist.name}, ${artist.playcount} plays na semana`}
    className="interactive-card group relative block overflow-visible rounded-md border border-site-border-muted bg-site-card no-underline transition-colors hover:z-20 hover:border-site-primary focus-visible:z-20"
  >
    <div className="relative aspect-square overflow-hidden rounded-md bg-site-card-hover">
      {artist.imageUrl ? (
        <Image
          src={artist.imageUrl}
          alt={artist.name}
          fill
          sizes="(min-width: 1024px) 160px, (min-width: 640px) 30vw, 45vw"
          className="object-contain"
        />
      ) : (
        <MusicFallback label={artist.name} />
      )}
    </div>
    <span className="pointer-events-none absolute left-3 top-full z-30 mt-2 min-w-24 max-w-[calc(100%-1.5rem)] rounded border border-site-border bg-[#0b0910] px-2.5 py-2 text-left opacity-0 shadow-lg shadow-black/40 transition duration-200 group-hover:translate-y-0.5 group-hover:opacity-100 group-focus-visible:translate-y-0.5 group-focus-visible:opacity-100">
      <span className="block truncate text-xs font-bold leading-4 text-site-foreground">
        {artist.name}
      </span>
      <span className="mt-0.5 block text-[11px] font-medium leading-4 text-site-body-muted">
        {artist.playcount} plays
      </span>
    </span>
  </Link>
);

const getTrackIdentity = (track: LastfmTrack) =>
  track.playedAt ?? `${track.name}-${track.artist}-${track.url}`;

const getUniqueTracks = (tracks: LastfmTrack[]) => {
  const seen = new Set<string>();

  return tracks.filter((track) => {
    const identity = getTrackIdentity(track);

    if (seen.has(identity)) return false;

    seen.add(identity);
    return true;
  });
};

export default async function NowPage() {
  const [lastfm, artists] = await Promise.all([
    getLastfmRecentStats().catch(() => ({
      nowPlaying: null,
      lastPlayed: null,
      tracks: [],
    })),
    getLastfmTopArtists({ period: '7day' }).catch(() => []),
  ]);

  const recentTracks = getUniqueTracks(
    [lastfm.lastPlayed, ...lastfm.tracks].filter(Boolean) as LastfmTrack[],
  );

  return (
    <PageWrapper>
      <main id="main">
        <div className="content">
          <header className="mb-14 flex max-w-3xl items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-md border border-site-primary bg-site-primary-soft text-site-primary">
              <HeadphonesIcon />
            </span>
            <div>
              <h1 className="m-0 text-4xl font-bold leading-none text-site-foreground sm:text-5xl">
                Ouvindo
              </h1>
              <p className="mb-0 mt-3 text-lg font-semibold leading-snug text-site-body-muted">
                {NOW_DESCRIPTION}
              </p>
            </div>
          </header>

          <div className="grid gap-12 lg:grid-cols-[1fr_28rem]">
            <section aria-labelledby="recent-tracks-title">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <h2
                  id="recent-tracks-title"
                  className="m-0 text-2xl font-bold text-site-foreground sm:text-3xl"
                >
                  Tocado recentemente
                </h2>
              </div>
              {recentTracks.length > 0 ? (
                <ul className="m-0 flex max-w-lg list-none flex-col gap-2 p-0">
                  {recentTracks.slice(0, 8).map((track, index) => (
                    <RecentTrack
                      key={`${track.name}-${track.artist}-${
                        track.playedAt ?? track.url
                      }-${index}`}
                      track={track}
                      priority={index === 0}
                    />
                  ))}
                </ul>
              ) : (
                <p className="m-0 text-site-body-muted">
                  Sem músicas recentes para mostrar.
                </p>
              )}
            </section>

            <section aria-labelledby="top-artists-title">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <h2
                  id="top-artists-title"
                  className="m-0 text-2xl font-bold text-site-foreground sm:text-3xl"
                >
                  Artistas da semana
                </h2>
              </div>
              {artists.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {artists.slice(0, 9).map((artist) => (
                      <ArtistCard key={artist.name} artist={artist} />
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="m-0 inline-flex items-center gap-1.5 text-xs font-medium text-site-body-muted">
                      Imagens dos artistas via
                      <FontAwesomeIcon
                        icon={faSpotify}
                        aria-label="Spotify"
                        role="img"
                        className="text-sm text-[#1DB954]"
                      />
                    </p>
                    <Link
                      href="https://www.last.fm/user/johnenderson"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border-b border-site-primary pb-0.5 text-sm font-bold text-site-primary no-underline transition-colors hover:border-site-primary-hover hover:text-site-primary-hover"
                    >
                      Ver no Last.fm
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        aria-hidden="true"
                        className="text-xs"
                      />
                    </Link>
                  </div>
                </>
              ) : (
                <p className="m-0 text-site-body-muted">
                  Sem artistas da semana para mostrar.
                </p>
              )}
            </section>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
