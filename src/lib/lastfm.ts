import { LastfmStats, LastfmTrack } from '@/types/Lastfm';

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const DEFAULT_LASTFM_USERNAME = 'johnenderson';

type LastfmApiImage = {
  '#text'?: string;
  size?: string;
};

type LastfmApiTrack = {
  name?: string;
  artist?: {
    '#text'?: string;
  };
  album?: {
    '#text'?: string;
  };
  url?: string;
  image?: LastfmApiImage[];
  date?: {
    uts?: string;
    '#text'?: string;
  };
  '@attr'?: {
    nowplaying?: string;
  };
};

type LastfmApiResponse = {
  recenttracks?: {
    track?: LastfmApiTrack | LastfmApiTrack[];
  };
};

type LastfmFetchOptions = {
  cache?: RequestCache;
  next?: {
    revalidate?: number;
  };
};

const getImageUrl = (images: LastfmApiImage[] | undefined) => {
  if (!images) return null;

  const preferred =
    images.find((image) => image.size === 'extralarge') ??
    images.find((image) => image.size === 'large') ??
    images.find((image) => image.size === 'medium') ??
    images.find((image) => image['#text']);

  return preferred?.['#text'] || null;
};

const mapTrack = (track: LastfmApiTrack): LastfmTrack => ({
  name: track.name ?? 'Faixa desconhecida',
  artist: track.artist?.['#text'] ?? 'Artista desconhecido',
  album: track.album?.['#text'] || null,
  url: track.url ?? 'https://www.last.fm/user/johnenderson',
  imageUrl: getImageUrl(track.image),
  nowPlaying: track['@attr']?.nowplaying === 'true',
  playedAt: track.date?.uts
    ? new Date(Number(track.date.uts) * 1000).toISOString()
    : null,
});

const getEmptyStats = (): LastfmStats => ({
  nowPlaying: null,
  lastPlayed: null,
  tracks: [],
});

async function getLastfmTracks(
  fetchOptions: LastfmFetchOptions = {},
): Promise<LastfmTrack[]> {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME ?? DEFAULT_LASTFM_USERNAME;

  if (!apiKey) {
    return [];
  }

  const params = new URLSearchParams({
    method: 'user.getrecenttracks',
    user: username,
    api_key: apiKey,
    format: 'json',
    limit: '6',
  });

  const response = await fetch(
    `${LASTFM_API_URL}?${params.toString()}`,
    fetchOptions,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Last.fm recent tracks');
  }

  const data = (await response.json()) as LastfmApiResponse;
  const rawTracks = data.recenttracks?.track;
  return (
    Array.isArray(rawTracks) ? rawTracks : rawTracks ? [rawTracks] : []
  ).map(mapTrack);
}

const createLastfmStats = (tracks: LastfmTrack[]): LastfmStats => {
  if (tracks.length === 0) return getEmptyStats();

  const nowPlaying = tracks.find((track) => track.nowPlaying) ?? null;
  const lastPlayed = tracks.find((track) => !track.nowPlaying) ?? null;
  const recentTracks = tracks
    .filter((track) => !track.nowPlaying)
    .filter((track) => (nowPlaying ? true : track.name !== lastPlayed?.name))
    .slice(0, 5);

  return {
    nowPlaying,
    lastPlayed,
    tracks: recentTracks,
  };
};

export async function getLastfmNowPlaying(): Promise<LastfmTrack | null> {
  const tracks = await getLastfmTracks({ cache: 'no-store' });

  return tracks.find((track) => track.nowPlaying) ?? null;
}

export async function getLastfmRecentStats(): Promise<LastfmStats> {
  const tracks = await getLastfmTracks({ next: { revalidate: 120 } });

  return createLastfmStats(tracks);
}

export async function getLastfmStats(): Promise<LastfmStats> {
  const tracks = await getLastfmTracks({ cache: 'no-store' });

  return createLastfmStats(tracks);
}
