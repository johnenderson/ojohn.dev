import Image from 'next/image';

import {
  CARD_HOVER_SMALL,
  CARD_INNER_RING,
  hoverRotation,
} from '../card-animation';

import { CardTooltip } from './CardTooltip';
import { ArtistFallback } from '@/features/now/components/MusicFallback';
import { LastfmArtist } from '@/types/Lastfm';

export const ArtistCard = ({
  artist,
  index,
}: {
  artist: LastfmArtist;
  index: number;
}) => (
  <CardTooltip
    content={
      <>
        <p className="text-xs font-bold leading-snug text-site-foreground">
          {artist.name}
        </p>
        <p className="mt-0.5 text-[11px] leading-none text-site-body-muted">
          <span className="text-site-foreground">{artist.playcount}</span> plays
        </p>
      </>
    }
  >
    <a
      href={
        artist.imageSource === 'spotify' && artist.spotifyUrl
          ? artist.spotifyUrl
          : artist.url
      }
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${artist.name}, ${artist.playcount} plays no mês`}
      className={`relative flex aspect-square overflow-hidden rounded-md bg-site-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-primary ${CARD_HOVER_SMALL} ${hoverRotation(
        index,
      )}`}
    >
      {artist.imageUrl ? (
        <Image
          src={artist.imageUrl}
          alt={artist.name}
          fill
          unoptimized
          sizes="(min-width: 1024px) 160px, (min-width: 640px) 30vw, 45vw"
          className="object-cover"
        />
      ) : (
        <ArtistFallback label={artist.name} />
      )}
      <span aria-hidden="true" className={CARD_INNER_RING} />
    </a>
  </CardTooltip>
);
