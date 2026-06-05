import { getSpotifyAccessToken } from './auth';

const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// As buscas são determinísticas e mudam pouco; cacheamos a resposta por 24h.
const SEARCH_REVALIDATE_SECONDS = 60 * 60 * 24;

type SpotifyImage = {
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
  images?: SpotifyImage[];
};

type SpotifyTrack = {
  external_urls?: {
    spotify?: string;
  };
  album?: {
    images?: SpotifyImage[];
  };
  artists?: {
    name?: string;
  }[];
  name?: string;
};

type SpotifyArtistSearchResponse = {
  artists?: {
    items?: SpotifyArtist[];
  };
};

type SpotifyTrackSearchResponse = {
  tracks?: {
    items?: SpotifyTrack[];
  };
};

export type SpotifyMatch = {
  imageUrl: string;
  spotifyUrl: string | null;
};

const getLargestImage = (images: SpotifyImage[] | undefined) => {
  const image = [...(images ?? [])].sort(
    (a, b) => (b.width ?? 0) - (a.width ?? 0),
  )[0];

  return image?.url ?? null;
};

// Normaliza para comparação: minúsculas, sem acentos (NFD + remoção de marcas
// combinantes) e sem pontuação.
const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getSpotifyTrackScore = (
  track: SpotifyTrack,
  trackName: string,
  artistName: string,
) => {
  const normalizedTrackName = normalizeSearchText(trackName);
  const normalizedArtistName = normalizeSearchText(artistName);
  const spotifyTrackName = normalizeSearchText(track.name ?? '');
  const spotifyArtistNames = (track.artists ?? []).map((artist) =>
    normalizeSearchText(artist.name ?? ''),
  );

  let score = 0;

  if (spotifyTrackName === normalizedTrackName) score += 6;
  else if (
    spotifyTrackName.includes(normalizedTrackName) ||
    normalizedTrackName.includes(spotifyTrackName)
  ) {
    score += 3;
  }

  if (spotifyArtistNames.includes(normalizedArtistName)) {
    score += 4;
  } else if (
    spotifyArtistNames.some(
      (artist) =>
        artist.includes(normalizedArtistName) ||
        normalizedArtistName.includes(artist),
    )
  ) {
    score += 2;
  }

  if (getLargestImage(track.album?.images)) score += 1;

  return score;
};

const searchSpotifyTracks = async (query: string, accessToken: string) => {
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: '10',
  });

  const response = await fetch(
    `${SPOTIFY_API_URL}/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: SEARCH_REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) return [];

  const data = (await response.json()) as SpotifyTrackSearchResponse;

  return data.tracks?.items ?? [];
};

/**
 * Busca a melhor imagem (e a URL no Spotify) para um artista pelo nome.
 * Retorna `null` se não houver token, resultado ou imagem.
 */
export const getSpotifyArtistImage = async (
  artistName: string,
): Promise<SpotifyMatch | null> => {
  const accessToken = await getSpotifyAccessToken();

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
        next: { revalidate: SEARCH_REVALIDATE_SECONDS },
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
    const imageUrl = getLargestImage(artist.images);

    if (!imageUrl) return null;

    return {
      imageUrl,
      spotifyUrl: artist.external_urls?.spotify ?? null,
    };
  } catch {
    return null;
  }
};

const pickBestMatch = (
  tracks: SpotifyTrack[],
  trackName: string,
  artistName: string,
): SpotifyMatch | null => {
  const scored = tracks
    .map((track) => ({
      track,
      score: getSpotifyTrackScore(track, trackName, artistName),
    }))
    .filter(
      ({ track, score }) => score > 0 && getLargestImage(track.album?.images),
    )
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.track;
  const imageUrl = getLargestImage(best?.album?.images);

  if (!imageUrl) return null;

  return {
    imageUrl,
    spotifyUrl: best.external_urls?.spotify ?? null,
  };
};

/**
 * Busca a melhor capa (e a URL no Spotify) para uma faixa.
 * Tenta primeiro a query precisa; só faz a fuzzy se necessário.
 * Retorna `null` se não houver token, match ou imagem.
 */
export const getSpotifyTrackImage = async (
  trackName: string,
  artistName: string,
): Promise<SpotifyMatch | null> => {
  const accessToken = await getSpotifyAccessToken();

  if (!accessToken) return null;

  try {
    const preciseTracks = await searchSpotifyTracks(
      `track:"${trackName}" artist:"${artistName}"`,
      accessToken,
    );
    const preciseMatch = pickBestMatch(preciseTracks, trackName, artistName);

    if (preciseMatch) return preciseMatch;

    const fuzzyTracks = await searchSpotifyTracks(
      `${trackName} ${artistName}`,
      accessToken,
    );

    return pickBestMatch(fuzzyTracks, trackName, artistName);
  } catch {
    return null;
  }
};
