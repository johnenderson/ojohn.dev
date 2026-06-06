const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Os tokens client_credentials do Spotify expiram em 1h; cacheamos por 50min
// para ter margem antes da expiração.
const TOKEN_TTL_MS = 50 * 60 * 1000;

type SpotifyAccessTokenResponse = {
  access_token?: string;
};

// Estado em memória (persiste entre requests no mesmo processo do servidor):
// - `tokenCache`: o token válido atual e quando ele expira.
// - `inFlightRequest`: a requisição de token em curso, para deduplicar
//   chamadas concorrentes.
let tokenCache: { token: string; expiresAt: number } | null = null;
let inFlightRequest: Promise<string | null> | null = null;

const requestAccessToken = async (
  clientId: string,
  clientSecret: string,
): Promise<string | null> => {
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
      tokenCache = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
    }

    return token;
  } catch {
    return null;
  }
};

/**
 * Retorna um token de acesso do Spotify (fluxo client_credentials), aplicando
 * três regras explícitas:
 *
 * 1. Credenciais: lê `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET` do ambiente.
 *    Sem elas, retorna `null` (o chamador trata a ausência de token).
 * 2. Cache em memória: reusa o token enquanto válido (TTL de 50min), evitando
 *    bater no endpoint de token a cada chamada.
 * 3. Dedupe de concorrência: se já existe uma requisição de token em voo (ex.:
 *    várias buscas disparadas em paralelo), todas aguardam a MESMA requisição.
 *    Pedir dois tokens simultâneos faz o Spotify invalidar um deles, e as
 *    chamadas seguintes passam a tomar 401.
 */
export const getSpotifyAccessToken = async (): Promise<string | null> => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  inFlightRequest ??= requestAccessToken(clientId, clientSecret).finally(() => {
    inFlightRequest = null;
  });

  return inFlightRequest;
};
