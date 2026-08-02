import Link from 'next/link';

import { PageWrapper } from '../components/PageWrapper';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import {
  faArrowRight,
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
  FeaturedTrack,
  GameCard,
  LanguageStack,
  LolChampionCard,
  LolLiveGame,
  LolMatchHistory,
  LolRankedCard,
  RadarCard,
  RecentTrack,
  StarredRepos,
} from '@/features/now/components';
import { getGithubDev, getGithubStarred } from '@/lib/github';
import {
  getLastfmRecentStats,
  getLastfmTopArtists,
  getLastfmTopTracks,
} from '@/lib/lastfm';
import { getLolLiveGame, getLolMatches, getLolProfile } from '@/lib/lol';
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
  'Às vezes eu sumo em algum jogo por uns dias. No momento, se eu aparecer online, provavelmente é League of Legends só para passar tempo.';
const MATHEUS_FIDELIS_BLOG_URL = 'https://fidelissauro.dev/';
const STEAM_PROFILE_URL =
  'https://steamcommunity.com/profiles/76561198796212584/';
const LOL_PROFILE_URL = 'https://www.op.gg/summoners/br/';
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

const computeTrackData = (topTracks: LastfmTrack[], lastfm: LastfmData) => {
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
  return { recentTracks, featuredTrack, recentTrackList };
};

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
  const [
    lastfm,
    artists,
    topTracks,
    dev,
    steam,
    lol,
    starred,
    lolMatches,
    lolLiveGame,
  ] = await Promise.all([
    getLastfmRecentStats().catch(() => ({
      nowPlaying: null,
      lastPlayed: null,
      tracks: [],
    })),
    getLastfmTopArtists({ period: '1month' }).catch(() => []),
    getLastfmTopTracks({ period: '1month' }).catch(() => []),
    getGithubDev().catch(() => null),
    getSteamGames().catch(() => ({ games: [], source: 'recent' as const })),
    getLolProfile().catch(() => null),
    getGithubStarred().catch(() => []),
    getLolMatches().catch(() => []),
    getLolLiveGame().catch(() => null),
  ]);

  const hasDevData = Boolean(
    dev && (dev.rhythm || dev.languages.length > 0 || dev.activity.length > 0),
  );

  const { featuredTrack, recentTrackList } = computeTrackData(
    topTracks,
    lastfm,
  );

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
              action={
                <Link
                  href="https://www.last.fm/user/johnenderson"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={SECTION_ACTION_CLASS}
                >
                  Ver no Last.fm →
                </Link>
              }
            />

            <div className="grid gap-12 lg:grid-cols-[1fr_32rem]">
              <section
                aria-labelledby="monthly-tracks-title"
                className="flex h-full flex-col"
              >
                <h3
                  id="monthly-tracks-title"
                  className="m-0 mb-5 text-lg font-bold text-site-foreground"
                >
                  Trilha do mês
                </h3>

                {featuredTrack ? (
                  <div className="mb-5 max-w-md">
                    <FeaturedTrack track={featuredTrack} />
                  </div>
                ) : null}

                <h4
                  id="recent-tracks-title"
                  className="m-0 mb-3 text-sm font-bold uppercase tracking-[0.08em] text-site-body-muted"
                >
                  Mais recentes
                </h4>
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
            />

            {/* League of Legends — mencionado na descrição, vem primeiro */}
            {lol && (
              <div
                aria-labelledby="lol-title"
                className={steam.games.length > 0 ? 'mb-12' : ''}
              >
                <header className="mb-6 max-w-3xl">
                  <h3
                    id="lol-title"
                    className="m-0 text-lg font-bold leading-tight text-site-foreground"
                  >
                    League of Legends
                  </h3>
                  <p className="mb-0 mt-2 text-base leading-snug text-site-body-muted">
                    Ranked Solo/Duo e os campeões com mais maestria.
                  </p>
                </header>

                <div className="flex flex-col gap-6">
                  {lolLiveGame && <LolLiveGame game={lolLiveGame} />}

                  {lol.ranked && <LolRankedCard ranked={lol.ranked} />}

                  {lol.topChampions.length > 0 && (
                    <div>
                      <h4 className="m-0 mb-3 text-sm font-bold uppercase tracking-[0.08em] text-site-body-muted">
                        Top campeões
                      </h4>
                      <div className="grid grid-cols-5 gap-3 lg:gap-6">
                        {lol.topChampions.map((champion, i) => (
                          <LolChampionCard
                            key={champion.id}
                            champion={champion}
                            index={i}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {lolMatches.length > 0 && (
                    <LolMatchHistory matches={lolMatches} />
                  )}

                  <div className="flex justify-end">
                    <Link
                      href={`${LOL_PROFILE_URL}${encodeURIComponent(
                        lol.summonerName.replace('#', '-'),
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border-b border-site-primary pb-0.5 text-sm font-bold text-site-primary no-underline transition-colors hover:border-site-primary-hover hover:text-site-primary-hover"
                    >
                      Ver no op.gg
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        aria-hidden="true"
                        className="text-xs"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Steam — conteúdo complementar */}
            {steam.games.length > 0 ? (
              <div
                className={
                  lol ? 'border-t border-site-border-subtle pt-10' : ''
                }
              >
                {lol && (
                  <h3 className="mb-5 text-lg font-bold text-site-foreground">
                    No Steam
                  </h3>
                )}
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:gap-6">
                    {steam.games.map((game) => (
                      <GameCard key={game.appid} game={game} />
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Link
                      href={STEAM_PROFILE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border-b border-site-primary pb-0.5 text-sm font-bold text-site-primary no-underline transition-colors hover:border-site-primary-hover hover:text-site-primary-hover"
                    >
                      Ver no Steam
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        aria-hidden="true"
                        className="text-xs"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`flex items-center justify-between gap-4${
                  lol ? ' border-t border-site-border-subtle pt-10' : ''
                }`}
              >
                <p className="m-0 text-site-body-muted">
                  Nenhum jogo para mostrar.
                </p>
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
            )}
          </section>
        </div>
      </main>
    </PageWrapper>
  );
}
