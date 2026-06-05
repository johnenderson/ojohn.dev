import { getSpotifyArtistImage, getSpotifyTrackImage } from '@/lib/spotify';
import {
  LastfmArtist,
  LastfmStats,
  LastfmTag,
  LastfmTrack,
} from '@/types/Lastfm';

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const DEFAULT_LASTFM_USERNAME = 'johnenderson';

const normalizeToArray = <T>(value: T | T[] | undefined): T[] =>
  Array.isArray(value) ? value : value ? [value] : [];

type LastfmApiImage = {
  '#text'?: string;
  size?: string;
};

type LastfmApiTrack = {
  name?: string;
  artist?: {
    '#text'?: string;
    name?: string;
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
  playcount?: string;
};

type LastfmApiArtist = {
  name?: string;
  url?: string;
  image?: LastfmApiImage[];
  playcount?: string;
};

type LastfmApiResponse = {
  recenttracks?: {
    track?: LastfmApiTrack | LastfmApiTrack[];
  };
  toptracks?: {
    track?: LastfmApiTrack | LastfmApiTrack[];
  };
  topartists?: {
    artist?: LastfmApiArtist | LastfmApiArtist[];
  };
};

type LastfmFetchOptions = {
  cache?: RequestCache;
  next?: {
    revalidate?: number;
  };
};

type LastfmTopPeriod =
  | '7day'
  | '1month'
  | '3month'
  | '6month'
  | '12month'
  | 'overall';

const LASTFM_PLACEHOLDER_IMAGE_IDS = [
  '2a96cbd8b46e442fc41c2b86b821562f',
  'c6f59c1e5e7240a4c0d427abd71f3dbb',
];

const isLastfmPlaceholderImage = (url: string) =>
  LASTFM_PLACEHOLDER_IMAGE_IDS.some((placeholderId) =>
    url.includes(placeholderId),
  );

const getImageUrl = (images: LastfmApiImage[] | undefined) => {
  if (!images) return null;

  const preferred =
    images.find((image) => image.size === 'extralarge') ??
    images.find((image) => image.size === 'large') ??
    images.find((image) => image.size === 'medium') ??
    images.find((image) => image['#text']);

  const url = preferred?.['#text'];

  if (!url || isLastfmPlaceholderImage(url)) return null;

  return url;
};

const getTrackArtistName = (track: LastfmApiTrack) =>
  track.artist?.['#text'] ?? track.artist?.name ?? 'Artista desconhecido';

const mapTrack = (track: LastfmApiTrack): LastfmTrack => ({
  name: track.name ?? 'Faixa desconhecida',
  artist: getTrackArtistName(track),
  album: track.album?.['#text'] || null,
  url: track.url ?? 'https://www.last.fm/user/johnenderson',
  imageUrl: getImageUrl(track.image),
  imageSource: null,
  spotifyUrl: null,
  nowPlaying: track['@attr']?.nowplaying === 'true',
  playedAt: track.date?.uts
    ? new Date(Number(track.date.uts) * 1000).toISOString()
    : null,
  playcount: track.playcount ? Number(track.playcount) : undefined,
});

const mapArtist = (artist: LastfmApiArtist): LastfmArtist => {
  return {
    name: artist.name ?? 'Artista desconhecido',
    url: artist.url ?? 'https://www.last.fm/user/johnenderson',
    imageUrl: null,
    imageSource: null,
    spotifyUrl: null,
    playcount: artist.playcount ? Number(artist.playcount) : 0,
  };
};

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
    limit: '7',
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
  return normalizeToArray(rawTracks).map(mapTrack);
}

const createLastfmStats = (tracks: LastfmTrack[]): LastfmStats => {
  if (tracks.length === 0) return getEmptyStats();

  const nowPlaying = tracks.find((track) => track.nowPlaying) ?? null;
  const lastPlayed = tracks.find((track) => !track.nowPlaying) ?? null;
  const recentTracks = tracks
    .filter((track) => !track.nowPlaying)
    .filter((track) => (nowPlaying ? true : track.name !== lastPlayed?.name))
    .slice(0, 6);

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
  const tracks = await getLastfmTracks({ cache: 'no-store' });

  return createLastfmStats(tracks);
}

export const getLastfmStats = getLastfmRecentStats;

export async function getLastfmTopTracks({
  period = '7day',
}: {
  period?: LastfmTopPeriod;
} = {}): Promise<LastfmTrack[]> {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME ?? DEFAULT_LASTFM_USERNAME;

  if (!apiKey) return [];

  const params = new URLSearchParams({
    method: 'user.gettoptracks',
    user: username,
    api_key: apiKey,
    format: 'json',
    period,
    limit: '1',
  });

  const response = await fetch(`${LASTFM_API_URL}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Last.fm top tracks');
  }

  const data = (await response.json()) as LastfmApiResponse;
  const rawTracks = data.toptracks?.track;
  const tracks = normalizeToArray(rawTracks).map((track) => ({
    ...mapTrack(track),
    imageUrl: null,
  }));

  return Promise.all(
    tracks.map(async (track) => {
      const spotifyTrack = await getSpotifyTrackImage(track.name, track.artist);

      if (!spotifyTrack) return track;

      return {
        ...track,
        imageUrl: spotifyTrack.imageUrl,
        imageSource: 'spotify' as const,
        spotifyUrl: spotifyTrack.spotifyUrl,
      };
    }),
  );
}

export async function getLastfmTopArtists({
  period = '7day',
}: {
  period?: LastfmTopPeriod;
} = {}): Promise<LastfmArtist[]> {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME ?? DEFAULT_LASTFM_USERNAME;

  if (!apiKey) return [];

  const params = new URLSearchParams({
    method: 'user.gettopartists',
    user: username,
    api_key: apiKey,
    format: 'json',
    period,
    limit: '9',
  });

  const response = await fetch(`${LASTFM_API_URL}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Last.fm top artists');
  }

  const data = (await response.json()) as LastfmApiResponse;
  const rawArtists = data.topartists?.artist;

  const artists = normalizeToArray(rawArtists).map(mapArtist);

  return Promise.all(
    artists.map(async (artist) => {
      const spotifyArtist = await getSpotifyArtistImage(artist.name);

      if (spotifyArtist) {
        const spotifyArtistWithImage: LastfmArtist = {
          ...artist,
          imageUrl: spotifyArtist.imageUrl,
          imageSource: 'spotify',
          spotifyUrl: spotifyArtist.spotifyUrl,
        };

        return spotifyArtistWithImage;
      }

      return artist;
    }),
  );
}

type LastfmApiTag = {
  name?: string;
  count?: number;
};

type LastfmArtistTagsResponse = {
  toptags?: {
    tag?: LastfmApiTag | LastfmApiTag[];
  };
};

// Tags do Last.fm que não são gênero/estilo — ruído que não queremos exibir.
const TAG_DENYLIST = new Set([
  'seen live',
  'favorites',
  'favourite',
  'favourites',
  'favorite',
  'favorite songs',
  'favourite songs',
  'spotify',
  'all',
  'love',
  'beautiful',
  'awesome',
  'my music',
]);

const fetchArtistTags = async (
  artist: string,
  apiKey: string,
): Promise<LastfmApiTag[]> => {
  const params = new URLSearchParams({
    method: 'artist.gettoptags',
    artist,
    api_key: apiKey,
    format: 'json',
    autocorrect: '1',
  });

  const response = await fetch(`${LASTFM_API_URL}?${params.toString()}`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) return [];

  const data = (await response.json()) as LastfmArtistTagsResponse;
  const raw = data.toptags?.tag;

  return normalizeToArray(raw);
};

export async function getLastfmTopTags({
  period = '1month',
  limit = 12,
}: {
  period?: LastfmTopPeriod;
  limit?: number;
} = {}): Promise<LastfmTag[]> {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME ?? DEFAULT_LASTFM_USERNAME;

  if (!apiKey) return [];

  const params = new URLSearchParams({
    method: 'user.gettopartists',
    user: username,
    api_key: apiKey,
    format: 'json',
    period,
    limit: '12',
  });

  const response = await fetch(`${LASTFM_API_URL}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) return [];

  const data = (await response.json()) as LastfmApiResponse;
  const rawArtists = data.topartists?.artist;
  const names = normalizeToArray(rawArtists)
    .map((artist) => artist.name)
    .filter((name): name is string => Boolean(name));

  const tagLists = await Promise.all(
    names.map((name) => fetchArtistTags(name, apiKey).catch(() => [])),
  );

  const weights = new Map<string, number>();

  for (const tags of tagLists) {
    // As 5 tags mais fortes de cada artista já bastam para o panorama.
    for (const tag of tags.slice(0, 5)) {
      const name = tag.name?.trim();
      if (!name || TAG_DENYLIST.has(name.toLowerCase())) continue;

      weights.set(name, (weights.get(name) ?? 0) + (tag.count ?? 0));
    }
  }

  return [...weights.entries()]
    .map(([name, weight]) => ({ name, weight }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}
