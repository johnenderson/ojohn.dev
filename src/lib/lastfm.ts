import { LastfmArtist, LastfmStats, LastfmTrack } from '@/types/Lastfm';

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
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
  topartists?: {
    artist?: LastfmApiArtist | LastfmApiArtist[];
  };
};

type SpotifyAccessTokenResponse = {
  access_token?: string;
};

type SpotifyArtistImage = {
  url?: string;
  width?: number;
  height?: number;
};

type SpotifyArtist = {
  external_urls?: {
    spotify?: string;
  };
  id?: string;
  name?: string;
  images?: SpotifyArtistImage[];
};

type SpotifyArtistSearchResponse = {
  artists?: {
    items?: SpotifyArtist[];
  };
};

type LastfmFetchOptions = {
  cache?: RequestCache;
  next?: {
    revalidate?: number;
  };
};

type LastfmTopArtistsPeriod =
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

let spotifyTokenCache: { token: string; expiresAt: number } | null = null;

const getSpotifyAccessToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  if (spotifyTokenCache && spotifyTokenCache.expiresAt > Date.now()) {
    return spotifyTokenCache.token;
  }

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`,
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as SpotifyAccessTokenResponse;
    const token = data.access_token ?? null;

    if (token) {
      // Tokens client_credentials duram 1h; cacheamos por 50min em memória.
      spotifyTokenCache = { token, expiresAt: Date.now() + 50 * 60 * 1000 };
    }

    return token;
  } catch {
    return null;
  }
};

const getSpotifyArtistImage = async (
  artistName: string,
  accessToken: string | null,
) => {
  if (!accessToken) return null;

  const params = new URLSearchParams({
    q: artistName,
    type: 'artist',
    limit: '5',
  });

  try {
    const response = await fetch(
      `${SPOTIFY_API_URL}/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        next: { revalidate: 60 * 60 * 24 },
      },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as SpotifyArtistSearchResponse;
    const artists = data.artists?.items ?? [];
    const exactMatch = artists.find(
      (artist) => artist.name?.toLowerCase() === artistName.toLowerCase(),
    );
    const artist = exactMatch ?? artists[0];

    if (!artist) return null;

    // A resposta da busca já inclui as imagens e a URL do artista, então não
    // precisamos de uma segunda chamada a /artists/{id}.
    const images = artist.images ?? [];
    const image = [...images].sort(
      (a, b) => (b.width ?? 0) - (a.width ?? 0),
    )[0];

    if (!image?.url) return null;

    return {
      imageUrl: image.url,
      spotifyUrl: artist.external_urls?.spotify ?? null,
    };
  } catch {
    return null;
  }
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

export async function getLastfmStats(): Promise<LastfmStats> {
  const tracks = await getLastfmTracks({ cache: 'no-store' });

  return createLastfmStats(tracks);
}

export async function getLastfmTopArtists({
  period = '7day',
}: {
  period?: LastfmTopArtistsPeriod;
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

  const artists = (
    Array.isArray(rawArtists) ? rawArtists : rawArtists ? [rawArtists] : []
  ).map(mapArtist);
  const spotifyAccessToken = await getSpotifyAccessToken();

  return Promise.all(
    artists.map(async (artist) => {
      const spotifyArtist = await getSpotifyArtistImage(
        artist.name,
        spotifyAccessToken,
      );

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
