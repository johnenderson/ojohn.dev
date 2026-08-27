import { cacheGet, cacheSet } from './redis';

const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_CDN_BASE = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

const debugLog = (...args: unknown[]) => {
  if (process.env.STEAM_DEBUG === 'true') {
    console.warn('[steam-debug]', ...args);
  }
};

// Jogos recentes: sincroniza 1x/dia (muda quando você joga algo novo)
const CACHE_TTL_RECENT = 60 * 60 * 24; // 24h
// Top all-time: ranking de horas totais não muda do dia pra noite
const CACHE_TTL_ALLTIME = 60 * 60 * 24 * 7; // 7 dias
const CACHE_KEY_RECENT = 'steam:recently-played:v4'; // v4: payload passa a incluir updatedAt
const CACHE_KEY_ALLTIME = 'steam:alltime:v4'; // v4: payload passa a incluir updatedAt

/** Quantos cards a grade exibe — sempre completamos até esse número. */
const TARGET_COUNT = 5;
/** Pool de all-time mantido em cache, com folga para o backfill após dedupe. */
const ALLTIME_POOL = 12;

/**
 * Apps que não são jogos de verdade e devem ser omitidos da lista.
 * Wallpaper Engine (431960), Spacewar (480 — app de teste Steam), etc.
 */
const STEAM_BLOCKLIST = new Set([
  431960, // Wallpaper Engine
  480, // Spacewar (app de teste Steam)
]);

export type SteamGame = {
  appid: number;
  name: string;
  /** Minutos jogados nas últimas 2 semanas (0 quando vem de owned games) */
  playtime2weeks: number;
  /** Minutos totais jogados */
  playtimeForever: number;
  /** Unix timestamp (segundos) da última vez que o jogo foi aberto; null se desconhecido */
  lastPlayedAt: number | null;
  /** URL da capa vertical (600×900) via Steam CDN */
  coverUrl: string;
  /** URL da biblioteca horizontal (460×215) — fallback */
  headerUrl: string;
  /** Página da loja do jogo */
  storeUrl: string;
};

export type SteamResult = {
  games: SteamGame[];
  /** 'recent' = jogados nas últimas 2 semanas; 'alltime' = mais jogados de todos os tempos */
  source: 'recent' | 'alltime';
  /** ISO de quando a lista foi sincronizada com a Steam pela última vez; null se nunca sincronizou. */
  updatedAt: string | null;
};

/** Payload cacheado — guarda o timestamp junto pra exibir "atualizado há X". */
type SteamCachePayload = {
  games: SteamGame[];
  updatedAt: string;
};

type SteamApiGame = {
  appid?: number;
  name?: string;
  playtime_2weeks?: number;
  playtime_forever?: number;
  /** Unix timestamp em segundos — disponível via GetOwnedGames com include_appinfo=1 */
  rtime_last_played?: number;
};

type SteamApiResponse = {
  response?: {
    total_count?: number;
    games?: SteamApiGame[];
  };
};

const toSteamGame = (game: SteamApiGame): SteamGame | null => {
  const appid = game.appid;
  const name = game.name;
  if (!appid || !name) return null;
  if (STEAM_BLOCKLIST.has(appid)) return null;

  return {
    appid,
    name,
    // Guardamos em minutos — o componente formata com formatPlaytime()
    playtime2weeks: game.playtime_2weeks ?? 0,
    playtimeForever: game.playtime_forever ?? 0,
    lastPlayedAt: game.rtime_last_played ?? null,
    coverUrl: `${STEAM_CDN_BASE}/${appid}/library_600x900.jpg`,
    headerUrl: `${STEAM_CDN_BASE}/${appid}/header.jpg`,
    storeUrl: `https://store.steampowered.com/app/${appid}`,
  };
};

const steamFetch = async (
  url: URL,
  apiKey: string,
): Promise<SteamApiResponse> => {
  debugLog('fetching:', url.toString().replace(apiKey, '***'));

  const response = await fetch(url.toString(), { cache: 'no-store' });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    debugLog(`HTTP ${response.status}:`, body);
    throw new Error(`Steam API error: ${response.status}`);
  }

  const data = (await response.json()) as SteamApiResponse;
  debugLog('response:', JSON.stringify(data.response));
  return data;
};

const fetchRecentlyPlayed = async (
  userId: string,
  apiKey: string,
  count = 20,
): Promise<SteamGame[]> => {
  const url = new URL(
    `${STEAM_API_BASE}/IPlayerService/GetRecentlyPlayedGames/v0001/`,
  );
  url.searchParams.set('key', apiKey);
  url.searchParams.set('steamid', userId);
  url.searchParams.set('count', String(count));
  url.searchParams.set('format', 'json');

  const data = await steamFetch(url, apiKey);
  const games = data.response?.games ?? [];

  if (!data.response?.games) {
    debugLog(
      'lista vazia — verifique se "Privacidade de jogos" está como Público no perfil Steam',
    );
  }

  return games
    .map(toSteamGame)
    .filter((game): game is SteamGame => game !== null)
    .slice(0, TARGET_COUNT);
};

const fetchTopAllTime = async (
  userId: string,
  apiKey: string,
): Promise<SteamGame[]> => {
  const url = new URL(`${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v0001/`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('steamid', userId);
  url.searchParams.set('include_appinfo', '1');
  url.searchParams.set('include_played_free_games', '1');
  url.searchParams.set('format', 'json');

  const data = await steamFetch(url, apiKey);
  const games = (data.response?.games ?? [])
    .filter((g) => (g.playtime_forever ?? 0) > 0)
    .sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));

  return games
    .map(toSteamGame)
    .filter((game): game is SteamGame => game !== null)
    .slice(0, ALLTIME_POOL);
};

/** Recentes (cache → API). Lista vazia em caso de falha. */
const getRecentGames = async (
  userId: string,
  apiKey: string,
): Promise<SteamCachePayload> => {
  const cached = await cacheGet<SteamCachePayload>(CACHE_KEY_RECENT);
  if (cached && cached.games.length > 0) {
    debugLog(`cache hit (recent): ${cached.games.length} jogos`);
    return cached;
  }

  try {
    const recent = await fetchRecentlyPlayed(userId, apiKey);
    debugLog(`api recent: ${recent.length} jogos`);
    if (recent.length === 0) return { games: [], updatedAt: '' };
    const payload: SteamCachePayload = {
      games: recent,
      updatedAt: new Date().toISOString(),
    };
    await cacheSet(CACHE_KEY_RECENT, payload, CACHE_TTL_RECENT);
    return payload;
  } catch (err) {
    debugLog('erro ao buscar recentes:', err);
    return { games: [], updatedAt: '' };
  }
};

/** Mais jogados de todos os tempos (cache → API). Lista vazia em caso de falha. */
const getAllTimeGames = async (
  userId: string,
  apiKey: string,
): Promise<SteamCachePayload> => {
  const cached = await cacheGet<SteamCachePayload>(CACHE_KEY_ALLTIME);
  if (cached && cached.games.length > 0) {
    debugLog(`cache hit (alltime): ${cached.games.length} jogos`);
    return cached;
  }

  try {
    const alltime = await fetchTopAllTime(userId, apiKey);
    debugLog(`api alltime: ${alltime.length} jogos`);
    if (alltime.length === 0) return { games: [], updatedAt: '' };
    const payload: SteamCachePayload = {
      games: alltime,
      updatedAt: new Date().toISOString(),
    };
    await cacheSet(CACHE_KEY_ALLTIME, payload, CACHE_TTL_ALLTIME);
    return payload;
  } catch (err) {
    debugLog('erro ao buscar all-time:', err);
    return { games: [], updatedAt: '' };
  }
};

export const getSteamGames = async (): Promise<SteamResult> => {
  const apiKey = process.env.STEAM_API_KEY;
  const userId = process.env.STEAM_USER_ID;

  if (!apiKey || !userId) {
    debugLog('STEAM_API_KEY ou STEAM_USER_ID ausentes');
    return { games: [], source: 'recent', updatedAt: null };
  }

  const recent = await getRecentGames(userId, apiKey);
  if (recent.games.length >= TARGET_COUNT) {
    return {
      games: recent.games.slice(0, TARGET_COUNT),
      source: 'recent',
      updatedAt: recent.updatedAt || null,
    };
  }

  // Menos recentes que o alvo: completa com os mais jogados de todos os tempos
  // (sem repetir os que já estão na lista) para a grade nunca ficar incompleta.
  const alltime = await getAllTimeGames(userId, apiKey);
  const seen = new Set(recent.games.map((game) => game.appid));
  const backfill = alltime.games.filter((game) => !seen.has(game.appid));
  const games = [...recent.games, ...backfill].slice(0, TARGET_COUNT);

  debugLog(
    `final: ${recent.games.length} recentes + ${
      games.length - recent.games.length
    } backfill`,
  );

  return {
    games,
    source: recent.games.length > 0 ? 'recent' : 'alltime',
    updatedAt: recent.updatedAt || alltime.updatedAt || null,
  };
};
