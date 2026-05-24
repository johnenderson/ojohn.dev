import Link from 'next/link';

import { PageWrapper } from '../components/PageWrapper';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import {
  faArrowRight,
  faBullseye,
  faGamepad,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Metadata } from 'next';

import { PageTitle } from '@/base/components/PageTitle';
import {
  ArtistCard,
  FeaturedTrack,
  RadarCard,
  RecentTrack,
  SectionIcon,
} from '@/features/now/components';
import {
  getLastfmRecentStats,
  getLastfmTopArtists,
  getLastfmTopTracks,
} from '@/lib/lastfm';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { LastfmTrack } from '@/types/Lastfm';

const NOW_TITLE = 'Fazendo agora';
const NOW_DESCRIPTION =
  'Um recorte do que anda ocupando minha cabeça fora dos commits.';
const RADAR_DESCRIPTION =
  'Cursos e assuntos que estão ocupando meus estudos no momento.';
const LISTENING_DESCRIPTION =
  'Sou um músico enferrujado, que continua amando música. Aqui ficam alguns rastros do que grudou no ouvido.';
const PLAYING_DESCRIPTION =
  'Às vezes eu sumo em algum jogo por uns dias. No momento, se eu aparecer online, provavelmente é League of Legends só para passar tempo.';
const MATHEUS_FIDELIS_BLOG_URL = 'https://fidelissauro.dev/';
const STEAM_PROFILE_URL =
  'https://steamcommunity.com/profiles/76561198796212584/';
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
  const [lastfm, artists, topTracks] = await Promise.all([
    getLastfmRecentStats().catch(() => ({
      nowPlaying: null,
      lastPlayed: null,
      tracks: [],
    })),
    getLastfmTopArtists({ period: '7day' }).catch(() => []),
    getLastfmTopTracks({ period: '7day' }).catch(() => []),
  ]);

  const recentTracks = getUniqueTracks(
    [lastfm.lastPlayed, ...lastfm.tracks].filter(Boolean) as LastfmTrack[],
  );
  const featuredTrack = topTracks[0] ?? recentTracks[0];
  const recentTrackList = featuredTrack
    ? recentTracks.filter(
        (track) =>
          track.name !== featuredTrack.name ||
          track.artist !== featuredTrack.artist,
      )
    : recentTracks;

  return (
    <PageWrapper>
      <main id="main">
        <div className="content">
          <PageTitle title="Fazendo agora" subtitle={NOW_DESCRIPTION} />

          <section
            aria-labelledby="radar-title"
            className="border-b border-site-border-subtle pb-16"
          >
            <header className="mb-10 flex max-w-3xl items-start gap-3 lg:gap-6 xl:-ml-[4.5rem]">
              <SectionIcon>
                <FontAwesomeIcon icon={faBullseye} className="size-6" />
              </SectionIcon>
              <div>
                <h2
                  id="radar-title"
                  className="m-0 text-3xl font-bold leading-none text-site-foreground sm:text-4xl"
                >
                  Radar atual
                </h2>
                <p className="mb-0 mt-3 text-base font-semibold leading-snug text-site-body-muted">
                  {RADAR_DESCRIPTION}
                </p>
              </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
              <RadarCard
                label="Curso"
                title="Descomplicando o EKS"
                href={MATHEUS_FIDELIS_BLOG_URL}
              >
                Fazendo o curso do <strong>Matheus Fidelis</strong> para deixar
                Kubernetes na AWS menos misterioso. Sem o Descomplicando o EKS,
                o EKS até hoje estaria complicado.
              </RadarCard>
              <RadarCard
                label="Curso"
                title="System Design"
                href={MATHEUS_FIDELIS_BLOG_URL}
              >
                Também estou fazendo o curso de <strong>System Design</strong>{' '}
                do <strong>Matheus Fidelis</strong> para organizar melhor
                decisões, trade-offs e arquitetura antes do código começar a
                gritar. Esse curso tem me ajudado muito a evoluir muito, mesmo
                que eu ainda esteja engatinhando nos estudos.
              </RadarCard>
            </div>
          </section>

          <section
            aria-labelledby="listening-title"
            className="border-b border-site-border-subtle py-16"
          >
            <header className="mb-10 flex max-w-3xl items-start gap-3 lg:gap-6 xl:-ml-[4.5rem]">
              <SectionIcon>
                <HeadphonesIcon />
              </SectionIcon>
              <div>
                <h2
                  id="listening-title"
                  className="m-0 text-3xl font-bold leading-none text-site-foreground sm:text-4xl"
                >
                  No repeat da semana
                </h2>
                <p className="mb-0 mt-3 text-base font-semibold leading-snug text-site-body-muted">
                  {LISTENING_DESCRIPTION}
                </p>
              </div>
            </header>

            <div className="grid gap-12 lg:grid-cols-[1fr_32rem]">
              <section
                aria-labelledby="weekly-tracks-title"
                className="flex h-full flex-col"
              >
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <h2
                    id="weekly-tracks-title"
                    className="m-0 text-xl font-bold text-site-foreground sm:text-2xl"
                  >
                    Trilha da semana
                  </h2>
                </div>

                {featuredTrack ? (
                  <div className="mb-5 max-w-md">
                    <FeaturedTrack track={featuredTrack} />
                  </div>
                ) : null}

                <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                  <h3
                    id="recent-tracks-title"
                    className="m-0 text-lg font-bold text-site-foreground sm:text-xl"
                  >
                    Mais recentes
                  </h3>
                </div>
                {recentTrackList.length > 0 ? (
                  <ul className="m-0 flex max-w-md flex-1 list-none flex-col justify-between gap-2 p-0">
                    {recentTrackList.slice(0, 4).map((track, index) => (
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
                    {featuredTrack
                      ? 'Sem outras músicas recentes para mostrar.'
                      : 'Sem músicas recentes para mostrar.'}
                  </p>
                )}
              </section>

              <section aria-labelledby="top-artists-title">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <h2
                    id="top-artists-title"
                    className="m-0 text-xl font-bold text-site-foreground sm:text-2xl"
                  >
                    Companhia da semana
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
                      <p className="m-0 inline-flex items-center gap-1.5 rounded-full border border-site-border-subtle px-2.5 py-1 text-xs font-medium text-site-body-muted">
                        <FontAwesomeIcon
                          icon={faSpotify}
                          aria-label="Spotify"
                          role="img"
                          className="text-sm text-[#1DB954]"
                        />
                        Imagens via Spotify
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
          </section>

          <section
            aria-labelledby="playing-title"
            className="grid gap-8 border-b border-site-border-subtle py-16 lg:grid-cols-[1fr_auto]"
          >
            <header className="flex max-w-3xl items-start gap-3 lg:gap-6 xl:-ml-[4.5rem]">
              <SectionIcon>
                <FontAwesomeIcon icon={faGamepad} className="size-6" />
              </SectionIcon>
              <div>
                <h2
                  id="playing-title"
                  className="m-0 text-3xl font-bold leading-none text-site-foreground sm:text-4xl"
                >
                  Provável recaída
                </h2>
                <p className="mb-0 mt-3 max-w-2xl text-base font-semibold leading-relaxed text-site-body-muted">
                  {PLAYING_DESCRIPTION}
                </p>
              </div>
            </header>
            <div className="flex items-end lg:justify-end">
              <Link
                href={STEAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-b border-site-primary pb-0.5 text-sm font-bold text-site-primary no-underline transition-colors hover:border-site-primary-hover hover:text-site-primary-hover"
              >
                Steam fica aqui
                <FontAwesomeIcon
                  icon={faArrowRight}
                  aria-hidden="true"
                  className="text-xs"
                />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </PageWrapper>
  );
}
