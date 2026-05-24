import Image from 'next/image';
import Link from 'next/link';

import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { MusicFallback } from '@/features/now/components/MusicFallback';
import { LastfmTrack } from '@/types/Lastfm';

export const FeaturedTrack = ({ track }: { track: LastfmTrack }) => {
  const spotifyHref =
    track.imageSource === 'spotify' && track.spotifyUrl
      ? track.spotifyUrl
      : null;

  return (
    <div className="interactive-card grid max-w-md grid-cols-[6.5rem_1fr] items-start gap-4 rounded-md border border-site-border-muted bg-site-card p-4 transition-colors hover:border-site-primary">
      <Link
        href={spotifyHref ?? track.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={
          spotifyHref
            ? `Abrir ${track.name} no Spotify`
            : `Abrir ${track.name} no Last.fm`
        }
        className="group/cover relative size-[6.5rem] overflow-hidden rounded bg-site-card-hover no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-primary"
      >
        {track.imageUrl ? (
          <Image
            src={track.imageUrl}
            alt={track.album ?? track.name}
            fill
            priority
            loading="eager"
            unoptimized
            sizes="104px"
            className={`transition-transform duration-200 group-hover/cover:scale-[1.04] ${
              track.imageSource === 'spotify'
                ? 'object-contain'
                : 'object-cover'
            }`}
          />
        ) : (
          <MusicFallback label={track.name} />
        )}
      </Link>
      <div className="min-w-0">
        <span className="block truncate text-xs font-bold uppercase leading-none tracking-[0.16em] text-site-primary">
          Faixa mais tocada
        </span>
        <h3 className="m-0 mt-2">
          <Link
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-xl font-bold leading-tight text-site-foreground no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
          >
            {track.name}
          </Link>
        </h3>
        <p className="mb-0 mt-1 truncate text-sm font-semibold leading-tight text-site-body-muted">
          {track.artist}
        </p>
        {track.album ? (
          <p className="mb-0 mt-1 truncate text-xs font-medium leading-tight text-site-body-muted">
            {track.album}
          </p>
        ) : null}
        {track.playcount ? (
          <p className="mb-0 mt-2 text-xs font-bold leading-tight text-site-primary">
            {track.playcount} plays na semana
          </p>
        ) : null}
        {track.imageSource === 'spotify' ? (
          <p className="mb-0 mt-2 inline-flex items-center gap-1.5 text-xs font-medium leading-tight text-site-body-muted">
            <FontAwesomeIcon
              icon={faSpotify}
              aria-label="Spotify"
              role="img"
              className="text-[#1DB954]"
            />
            Capa via Spotify
          </p>
        ) : null}
      </div>
    </div>
  );
};
