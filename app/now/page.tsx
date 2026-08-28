import Link from 'next/link';

import { PageWrapper } from '../components/PageWrapper';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import {
  faBullseye,
  faCode,
  faGamepad,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Metadata } from 'next';

import { PageTitle } from '@/base/components/PageTitle';
import {
  SECTION_ACTION_CLASS,
  SectionHeader,
} from '@/base/components/SectionHeader';
import {
  ActivityFeed,
  ArtistCard,
  CodingRhythm,
  GameCard,
  LanguageStack,
  LolLiveGame,
  RadarCard,
  RecentTrack,
  StarredRepos,
} from '@/features/now/components';
import { getGithubDev, getGithubStarred } from '@/lib/github';
import { getLastfmRecentStats, getLastfmTopArtists } from '@/lib/lastfm';
import { getLolLiveGame } from '@/lib/lol';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { getSteamGames } from '@/lib/steam';
import { LastfmTrack } from '@/types/Lastfm';

const NOW_TITLE = 'Fazendo agora';
const NOW_DESCRIPTION =
  'Um recorte do que anda ocupando minha cabeça fora dos commits.';
const RADAR_DESCRIPTION =
  'Cursos e assuntos que estão ocupando meus estudos no momento.';
const CODE_DESCRIPTION =
  'Meus padrões de commit, a stack que mais uso e o que andei publicando no GitHub.';
const LISTENING_DESCRIPTION =
  'Sou um músico enferrujado, que continua amando música. Aqui ficam alguns rastros do que grudou no ouvido.';
const PLAYING_DESCRIPTION =
  'Às vezes eu sumo em algum jogo por uns dias. Aqui ficam os que andei jogando mais.';
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
    className="size-4"
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

type LastfmData = {
  nowPlaying: LastfmTrack | null;
  lastPlayed: LastfmTrack | null;
  tracks: LastfmTrack[];
};

const computeTrackData = (lastfm: LastfmData) =>
  getUniqueTracks(
    [lastfm.nowPlaying, lastfm.lastPlayed, ...lastfm.tracks].filter(
      Boolean,
    ) as LastfmTrack[],
  );

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
  const [lastfm, artists, dev, steam, starred, lolLiveGame] = await Promise.all(
    [
      getLastfmRecentStats().catch(() => ({
        nowPlaying: null,
        lastPlayed: null,
        tracks: [],
      })),
      getLastfmTopArtists({ period: '1month' }).catch(() => []),
      getGithubDev().catch(() => null),
      getSteamGames().catch(() => ({
        games: [],
        source: 'recent' as const,
        updatedAt: null,
      })),
      getGithubStarred().catch(() => []),
      getLolLiveGame().catch(() => null),
    ],
  );

  const hasDevData = Boolean(
    dev && (dev.rhythm || dev.languages.length > 0 || dev.activity.length > 0),
  );

  // Momento em que a página foi gerada — teto real de "atualizado há X" para
  // as seções sem cache próprio (GitHub, Last.fm): elas buscam ao vivo a
  // cada regeneração da página (revalidate acima), então "agora" aqui É a
  // última sincronização.
  const renderedAt = new Date().toISOString();

  const recentTracks = computeTrackData(lastfm);

  return (
    <PageWrapper>
      <main id="main">
        <div className="content">
          <PageTitle title="Fazendo agora" subtitle={NOW_DESCRIPTION} />

          <section
            aria-labelledby="radar-title"
            className="border-b border-site-border-subtle pb-16"
          >
            <SectionHeader
              icon={
                <FontAwesomeIcon
                  icon={faBullseye}
                  aria-hidden="true"
                  className="size-4"
                />
              }
              id="radar-title"
              title="Radar atual"
              subtitle={RADAR_DESCRIPTION}
            />

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

          {hasDevData ? (
            <section
              aria-labelledby="code-title"
              className="border-b border-site-border-subtle py-16"
            >
              <SectionHeader
                icon={
                  <FontAwesomeIcon
                    icon={faCode}
                    aria-hidden="true"
                    className="size-4"
                  />
                }
                id="code-title"
                title="Código"
                subtitle={CODE_DESCRIPTION}
                updatedAt={renderedAt}
              />

              <div className="flex flex-col gap-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  {dev?.rhythm ? <CodingRhythm rhythm={dev.rhythm} /> : null}
                  <LanguageStack languages={dev?.languages ?? []} />
                </div>
                <ActivityFeed items={dev?.activity ?? []} />
                {starred.length > 0 && <StarredRepos repos={starred} />}
              </div>
            </section>
          ) : null}

          {!hasDevData && starred.length > 0 && (
            <section
              aria-labelledby="starred-title"
              className="border-b border-site-border-subtle py-16"
            >
              <SectionHeader
                icon={
                  <FontAwesomeIcon
                    icon={faCode}
                    aria-hidden="true"
                    className="size-4"
                  />
                }
                id="starred-title"
                title="Código"
                updatedAt={renderedAt}
              />
              <StarredRepos repos={starred} />
            </section>
          )}

          <section
            aria-labelledby="listening-title"
            className="border-b border-site-border-subtle py-16"
          >
            <SectionHeader
              icon={<HeadphonesIcon />}
              id="listening-title"
              title="No repeat do mês"
              subtitle={LISTENING_DESCRIPTION}
              updatedAt={renderedAt}
            />

            <div className="grid gap-12 lg:grid-cols-[1fr_32rem]">
              <section aria-labelledby="recent-tracks-title">
                <h3
                  id="recent-tracks-title"
                  className="m-0 mb-5 text-lg font-bold text-site-foreground"
                >
                  Mais recentes
                </h3>
                {recentTracks.length > 0 ? (
                  <ul className="m-0 flex max-w-md list-none flex-col gap-1 p-0">
                    {recentTracks.slice(0, 7).map((track, index) => (
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
                <h3
                  id="top-artists-title"
                  className="m-0 mb-5 text-lg font-bold text-site-foreground"
                >
                  Companhia do mês
                </h3>
                {artists.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      {artists.slice(0, 9).map((artist, index) => (
                        <ArtistCard
                          key={artist.name}
                          artist={artist}
                          index={index}
                        />
                      ))}
                    </div>
                    <p className="m-0 mt-3 inline-flex items-center gap-1.5 rounded-full border border-site-border-subtle px-2.5 py-1 text-xs font-medium text-site-body-muted">
                      <FontAwesomeIcon
                        icon={faSpotify}
                        aria-label="Spotify"
                        role="img"
                        className="text-sm text-[#1DB954]"
                      />
                      Imagens via Spotify
                    </p>
                  </>
                ) : (
                  <p className="m-0 text-site-body-muted">
                    Sem artistas do mês para mostrar.
                  </p>
                )}
              </section>
            </div>

            <div className="mt-6 flex justify-end">
              <Link
                href="https://www.last.fm/user/johnenderson"
                target="_blank"
                rel="noopener noreferrer"
                className={SECTION_ACTION_CLASS}
              >
                Ver no Last.fm →
              </Link>
            </div>
          </section>

          <section aria-labelledby="playing-title" className="pt-16">
            <SectionHeader
              icon={
                <FontAwesomeIcon
                  icon={faGamepad}
                  aria-hidden="true"
                  className="size-4"
                />
              }
              id="playing-title"
              title="Provável recaída"
              subtitle={PLAYING_DESCRIPTION}
              updatedAt={steam.updatedAt}
            />

            {lolLiveGame && (
              <div className="mb-8">
                <h3 className="m-0 mb-3 text-lg font-bold text-site-foreground">
                  League of Legends
                </h3>
                <LolLiveGame game={lolLiveGame} />
              </div>
            )}

            {steam.games.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:gap-6">
                {steam.games.map((game) => (
                  <GameCard key={game.appid} game={game} />
                ))}
              </div>
            ) : (
              <p className="m-0 text-site-body-muted">
                Nenhum jogo para mostrar.
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <Link
                href={STEAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={SECTION_ACTION_CLASS}
              >
                {steam.games.length > 0 ? 'Ver no Steam' : 'Steam fica aqui'} →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </PageWrapper>
  );
}
