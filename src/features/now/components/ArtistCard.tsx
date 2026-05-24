import Image from 'next/image';
import Link from 'next/link';

import { ArtistFallback } from '@/features/now/components/MusicFallback';
import { LastfmArtist } from '@/types/Lastfm';

export const ArtistCard = ({ artist }: { artist: LastfmArtist }) => (
  <Link
    href={
      artist.imageSource === 'spotify' && artist.spotifyUrl
        ? artist.spotifyUrl
        : artist.url
    }
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`${artist.name}, ${artist.playcount} plays na semana`}
    title={`${artist.name} - ${artist.playcount} plays na semana`}
    className="interactive-card group relative block overflow-visible rounded-md border border-site-border-muted bg-site-card no-underline transition-colors hover:z-20 hover:border-site-primary focus-visible:z-20"
  >
    <div className="relative aspect-square overflow-hidden rounded-md bg-site-card-hover">
      {artist.imageUrl ? (
        <Image
          src={artist.imageUrl}
          alt={artist.name}
          fill
          unoptimized
          sizes="(min-width: 1024px) 160px, (min-width: 640px) 30vw, 45vw"
          className="object-contain"
        />
      ) : (
        <ArtistFallback label={artist.name} />
      )}
    </div>
    <span className="pointer-events-none absolute left-3 top-full z-30 mt-2 min-w-24 max-w-[calc(100%-1.5rem)] rounded border border-site-border bg-[#0b0910] px-2.5 py-2 text-left opacity-0 shadow-lg shadow-black/40 transition duration-200 group-hover:translate-y-0.5 group-hover:opacity-100 group-focus-visible:translate-y-0.5 group-focus-visible:opacity-100 group-active:translate-y-0.5 group-active:opacity-100">
      <span className="block truncate text-xs font-bold leading-4 text-site-foreground">
        {artist.name}
      </span>
      <span className="mt-0.5 block text-[11px] font-medium leading-4 text-site-body-muted">
        {artist.playcount} plays
      </span>
    </span>
  </Link>
);
