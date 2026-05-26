import Image from 'next/image';

import { Card } from '@/base/components/Card';
import { ArtistFallback } from '@/features/now/components/MusicFallback';
import { LastfmArtist } from '@/types/Lastfm';

export const ArtistCard = ({ artist }: { artist: LastfmArtist }) => (
  <Card
    href={
      artist.imageSource === 'spotify' && artist.spotifyUrl
        ? artist.spotifyUrl
        : artist.url
    }
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`${artist.name}, ${artist.playcount} plays na semana`}
    interactive
    className="group transition-colors hover:z-20 hover:border-site-primary focus-visible:z-20"
  >
    <div className="relative aspect-square overflow-hidden rounded-md bg-site-card-hover">
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
      <span className="pointer-events-none absolute inset-x-2 bottom-2 z-20 translate-y-1 rounded border border-site-border bg-site-popover/95 px-2.5 py-2 text-left opacity-0 shadow-xl shadow-black/25 backdrop-blur transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-active:translate-y-0 group-active:opacity-100">
        <span className="block truncate text-xs font-bold leading-4 text-site-foreground">
          {artist.name}
        </span>
        <span className="mt-0.5 block text-[11px] font-medium leading-4 text-site-body-muted">
          {artist.playcount} plays
        </span>
      </span>
    </div>
  </Card>
);
