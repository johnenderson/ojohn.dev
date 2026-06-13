import { cacheGet, cacheSet } from './redis';

// Regiões da Riot API
const RIOT_REGIONAL = 'https://americas.api.riotgames.com'; // roteamento continental
const RIOT_PLATFORM = 'https://br1.api.riotgames.com'; // servidor do jogo (BR)
const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';

const CACHE_TTL_RANKED = 60 * 60 * 6; // 6h — elo muda com frequência
const CACHE_TTL_CHAMPIONS = 60 * 60 * 24; // 24h — maestria muda menos
// Resultado incompleto (ex.: campeão fora da versão do DDragon em cache) só vive
// 30min, para não "grudar" 24h e se auto-corrigir no próximo carregamento.
const CACHE_TTL_CHAMPIONS_PARTIAL = 60 * 30;
const CACHE_TTL_VERSION = 60 * 60 * 24 * 7; // 7d — versão do patch

/** Quantos campeões a grade exibe. */
const TOP_CHAMPION_COUNT = 5;
/** Maestrias buscadas — folga para sobrar TOP_CHAMPION_COUNT mesmo se algum
 * championId não mapear na versão do Data Dragon em cache. */
const MASTERY_COUNT = 12;

const CACHE_KEY_RANKED = 'lol:ranked:v3';
const CACHE_KEY_CHAMPIONS = 'lol:champions:v3'; // v3: descarta cache curto (4) gravado antes do backfill/TTL
const CACHE_KEY_VERSION = 'lol:ddragon-version:v2';
const CACHE_KEY_IDENTITY = 'lol:identity:v3'; // puuid + iconId — v3: invalidate after API key rotation
const CACHE_KEY_MATCHES = 'lol:matches:v1';
const CACHE_TTL_IDENTITY = 60 * 60 * 24 * 30; // 30d — muda só se trocar de nick
const CACHE_TTL_MATCHES = 60 * 15; // 15min — partidas mudam com frequência

const debugLog = (...args: unknown[]) => {
  if (process.env.LOL_DEBUG === 'true') {
    console.warn('[lol-debug]', ...args);
  }
};

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type LolRanked = {
  tier: string; // IRON, BRONZE, SILVER, GOLD, PLATINUM, EMERALD, DIAMOND, MASTER, GRANDMASTER, CHALLENGER
  rank: string; // I, II, III, IV
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: number; // 0–100
  /** URL do emblema do tier via Community Dragon */
  emblemUrl: string;
};

export type LolChampion = {
  id: string; // chave interna (ex: "Jinx")
  name: string;
  /** Pontos de maestria */
  masteryPoints: number;
  masteryLevel: number;
  /** URL do ícone quadrado via Data Dragon */
  iconUrl: string;
  /** URL da splash art */
  splashUrl: string;
};

export type LolProfile = {
  ranked: LolRanked | null;
  topChampions: LolChampion[];
  summonerName: string;
  profileIconUrl: string;
};

export type LolMatch = {
  matchId: string;
  championId: string;
  championIconUrl: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  durationSeconds: number;
  queueId: number;
  playedAt: number;
};

export type LolLiveGame = {
  championId: string;
  championIconUrl: string;
  gameMode: string;
  gameLengthSeconds: number;
};

// ─── Helpers internos ────────────────────────────────────────────────────────

const riotFetch = async <T>(url: string, apiKey: string): Promise<T | null> => {
  debugLog('GET', url.replace(apiKey, '***'));

  let response: Response;
  try {
    response = await fetch(url, {
      cache: 'no-store',
      headers: { 'X-Riot-Token': apiKey },
    });
  } catch (err) {
    debugLog('fetch network error:', String(err));
    throw err;
  }

  debugLog(`response status: ${response.status}`);

  if (response.status === 404) {
    debugLog('404 not found');
    return null;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    debugLog(`HTTP ${response.status}:`, body);
    throw new Error(`Riot API ${response.status}: ${url}`);
  }

  const json = await response.json().catch((err: unknown) => {
    debugLog('JSON parse error:', String(err));
    throw err;
  });
  return json as T;
};

type AccountDto = { puuid: string; gameName: string; tagLine: string };
type SummonerDto = {
  profileIconId: number;
  summonerLevel: number;
  puuid: string;
};
type LeagueEntryDto = {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};
type MasteryDto = {
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
};
type ChampionListData = {
  version: string;
  data: Record<string, { key: string; id: string; name: string }>;
};

const getDDragonVersion = async (apiKey: string): Promise<string> => {
  const cached = await cacheGet<string>(CACHE_KEY_VERSION);
  if (cached) return cached;

  // Versão mais recente do patch
  const versions = await riotFetch<string[]>(
    `${DDRAGON_BASE}/api/versions.json`,
    apiKey,
  );
  const version = versions?.[0] ?? '15.1.1';
  await cacheSet(CACHE_KEY_VERSION, version, CACHE_TTL_VERSION);
  return version;
};

const buildEmblemUrl = (tier: string) => {
  const t = tier.toLowerCase();
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked-mini-crests/${t}.png`;
};

// ─── Loader principal ────────────────────────────────────────────────────────

type CachedIdentity = {
  puuid: string;
  profileIconId: number;
  summonerName: string;
};

const resolveIdentity = async (
  apiKey: string,
  gameName: string,
  tagLine: string,
): Promise<CachedIdentity | null> => {
  const cached = await cacheGet<CachedIdentity>(CACHE_KEY_IDENTITY);
  if (cached) {
    debugLog('identity cache hit');
    return cached;
  }

  debugLog('identity cache miss — buscando na API');

  const account = await riotFetch<AccountDto>(
    `${RIOT_REGIONAL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      gameName,
    )}/${encodeURIComponent(tagLine)}`,
    apiKey,
  );
  if (!account) {
    debugLog('conta não encontrada para', `${gameName}#${tagLine}`);
    return null;
  }
  debugLog('account ok, puuid:', account.puuid.slice(0, 8) + '...');

  const summoner = await riotFetch<SummonerDto>(
    `${RIOT_PLATFORM}/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
    apiKey,
  );
  debugLog('summoner raw:', JSON.stringify(summoner).slice(0, 200));
  if (!summoner) {
    debugLog('summoner não encontrado');
    return null;
  }
  debugLog('summoner ok, profileIconId:', summoner.profileIconId);

  const identity: CachedIdentity = {
    puuid: account.puuid,
    profileIconId: summoner.profileIconId,
    summonerName: `${account.gameName}#${account.tagLine}`,
  };
  await cacheSet(CACHE_KEY_IDENTITY, identity, CACHE_TTL_IDENTITY);
  return identity;
};

const fetchRankedData = async (
  apiKey: string,
  puuid: string,
): Promise<LolRanked | null> => {
  const cached = await cacheGet<LolRanked>(CACHE_KEY_RANKED);
  if (cached) {
    debugLog('cache hit ranked');
    return cached;
  }

  debugLog('buscando ranked para puuid:', puuid.slice(0, 8) + '...');
  const entries = await riotFetch<LeagueEntryDto[]>(
    `${RIOT_PLATFORM}/lol/league/v4/entries/by-puuid/${puuid}`,
    apiKey,
  ).catch((e) => {
    debugLog('ranked error:', e);
    return null;
  });

  const soloQ = entries?.find((e) => e.queueType === 'RANKED_SOLO_5x5');
  if (!soloQ) return null;

  const total = soloQ.wins + soloQ.losses;
  const ranked: LolRanked = {
    tier: soloQ.tier,
    rank: soloQ.rank,
    leaguePoints: soloQ.leaguePoints,
    wins: soloQ.wins,
    losses: soloQ.losses,
    winRate: total > 0 ? Math.round((soloQ.wins / total) * 100) : 0,
    emblemUrl: buildEmblemUrl(soloQ.tier),
  };
  await cacheSet(CACHE_KEY_RANKED, ranked, CACHE_TTL_RANKED);
  return ranked;
};

const fetchTopChampionsData = async (
  apiKey: string,
  puuid: string,
  version: string,
): Promise<LolChampion[]> => {
  const cached = await cacheGet<LolChampion[]>(CACHE_KEY_CHAMPIONS);
  if (cached && cached.length > 0) {
    debugLog(`cache hit champions: ${cached.length}`);
    return cached;
  }

  debugLog('buscando maestrias e champion list');
  const [masteries, championListData] = await Promise.all([
    riotFetch<MasteryDto[]>(
      `${RIOT_PLATFORM}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=${MASTERY_COUNT}`,
      apiKey,
    ).catch((e) => {
      debugLog('masteries error:', e);
      return null;
    }),
    riotFetch<ChampionListData>(
      `${DDRAGON_BASE}/cdn/${version}/data/pt_BR/champion.json`,
      apiKey,
    ).catch(() => null),
  ]);

  if (!masteries || !championListData) return [];

  const idToChampion = new Map(
    Object.values(championListData.data).map((c) => [Number(c.key), c]),
  );

  const topChampions = masteries
    .map((m) => {
      const champ = idToChampion.get(m.championId);
      if (!champ) return null;
      return {
        id: champ.id,
        name: champ.name,
        masteryPoints: m.championPoints,
        masteryLevel: m.championLevel,
        iconUrl: `${DDRAGON_BASE}/cdn/${version}/img/champion/${champ.id}.png`,
        splashUrl: `${DDRAGON_BASE}/cdn/img/champion/splash/${champ.id}_0.jpg`,
      };
    })
    .filter((c): c is LolChampion => c !== null)
    .slice(0, TOP_CHAMPION_COUNT);

  if (topChampions.length > 0) {
    // Conjunto completo vive 24h; incompleto vive pouco e tenta de novo logo.
    const ttl =
      topChampions.length >= TOP_CHAMPION_COUNT
        ? CACHE_TTL_CHAMPIONS
        : CACHE_TTL_CHAMPIONS_PARTIAL;
    await cacheSet(CACHE_KEY_CHAMPIONS, topChampions, ttl);
  }

  return topChampions;
};

const loadLolProfile = async (): Promise<LolProfile | null> => {
  const apiKey = process.env.RIOT_API_KEY;
  const riotId = process.env.LOL_RIOT_ID;

  if (!apiKey || !riotId) {
    debugLog('RIOT_API_KEY ou LOL_RIOT_ID ausentes');
    return null;
  }

  const [gameName, tagLine] = riotId.split('#');
  if (!gameName || !tagLine) {
    debugLog('LOL_RIOT_ID inválido — use o formato NomeDeJogo#TAG');
    return null;
  }

  debugLog('carregando perfil para', riotId);

  const identity = await resolveIdentity(apiKey, gameName, tagLine);
  if (!identity) return null;

  const version = await getDDragonVersion(apiKey);
  const profileIconUrl = `${DDRAGON_BASE}/cdn/${version}/img/profileicon/${identity.profileIconId}.png`;
  const summonerName = identity.summonerName;

  const [ranked, topChampions] = await Promise.all([
    fetchRankedData(apiKey, identity.puuid),
    fetchTopChampionsData(apiKey, identity.puuid, version),
  ]);

  debugLog(
    `profile ok: ranked=${ranked?.tier ?? 'none'}, champions=${
      topChampions.length
    }`,
  );

  return { ranked, topChampions, summonerName, profileIconUrl };
};

export const getLolProfile = loadLolProfile;

// ─── Match History ────────────────────────────────────────────────────────────

const QUEUE_LABELS: Record<number, string> = {
  420: 'Ranked Solo',
  440: 'Ranked Flex',
  400: 'Normal',
  450: 'ARAM',
  900: 'URF',
  1020: 'One for All',
};

type MatchDto = {
  metadata: { matchId: string; participants: string[] };
  info: {
    gameDuration: number;
    gameEndTimestamp: number;
    queueId: number;
    gameMode: string;
    participants: {
      puuid: string;
      championName: string;
      win: boolean;
      kills: number;
      deaths: number;
      assists: number;
    }[];
  };
};

type SpectatorDto = {
  gameId: number;
  gameMode: string;
  gameLength: number;
  participants: { puuid: string; championId: number }[];
};

const loadLolMatches = async (): Promise<LolMatch[]> => {
  const apiKey = process.env.RIOT_API_KEY;
  const riotId = process.env.LOL_RIOT_ID;
  if (!apiKey || !riotId) return [];

  const [gameName, tagLine] = riotId.split('#');
  if (!gameName || !tagLine) return [];

  const cached = await cacheGet<LolMatch[]>(CACHE_KEY_MATCHES);
  if (cached && cached.length > 0) {
    debugLog(`match cache hit: ${cached.length}`);
    return cached;
  }

  const identity = await resolveIdentity(apiKey, gameName, tagLine);
  if (!identity) return [];

  const version = await getDDragonVersion(apiKey);

  const matchIds = await riotFetch<string[]>(
    `${RIOT_REGIONAL}/lol/match/v5/matches/by-puuid/${identity.puuid}/ids?count=5`,
    apiKey,
  );
  if (!matchIds || matchIds.length === 0) return [];

  const matches = await Promise.all(
    matchIds.map((id) =>
      riotFetch<MatchDto>(
        `${RIOT_REGIONAL}/lol/match/v5/matches/${id}`,
        apiKey,
      ).catch(() => null),
    ),
  );

  const result: LolMatch[] = matches
    .filter((m): m is MatchDto => m !== null)
    .map((m) => {
      const player = m.info.participants.find(
        (p) => p.puuid === identity.puuid,
      );
      if (!player) return null;
      return {
        matchId: m.metadata.matchId,
        championId: player.championName,
        championIconUrl: `${DDRAGON_BASE}/cdn/${version}/img/champion/${player.championName}.png`,
        win: player.win,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        durationSeconds: m.info.gameDuration,
        queueId: m.info.queueId,
        playedAt: m.info.gameEndTimestamp,
      };
    })
    .filter((m): m is LolMatch => m !== null);

  if (result.length > 0) {
    await cacheSet(CACHE_KEY_MATCHES, result, CACHE_TTL_MATCHES);
  }

  debugLog(`matches ok: ${result.length}`);
  return result;
};

const loadLolLiveGame = async (): Promise<LolLiveGame | null> => {
  const apiKey = process.env.RIOT_API_KEY;
  const riotId = process.env.LOL_RIOT_ID;
  if (!apiKey || !riotId) return null;

  const [gameName, tagLine] = riotId.split('#');
  if (!gameName || !tagLine) return null;

  const identity = await resolveIdentity(apiKey, gameName, tagLine);
  if (!identity) return null;

  const version = await getDDragonVersion(apiKey);

  const game = await riotFetch<SpectatorDto>(
    `${RIOT_PLATFORM}/lol/spectator/v5/active-games/by-summoner/${identity.puuid}`,
    apiKey,
  );
  if (!game) return null; // 404 = not in game

  const participant = game.participants.find((p) => p.puuid === identity.puuid);
  if (!participant) return null;

  // Map championId → name via Data Dragon
  const championList = await riotFetch<ChampionListData>(
    `${DDRAGON_BASE}/cdn/${version}/data/pt_BR/champion.json`,
    apiKey,
  ).catch(() => null);

  const champ = championList
    ? Object.values(championList.data).find(
        (c) => Number(c.key) === participant.championId,
      )
    : null;

  const championName = champ?.id ?? 'Unknown';

  debugLog(`live game: ${championName}, ${game.gameLength}s`);

  return {
    championId: championName,
    championIconUrl: `${DDRAGON_BASE}/cdn/${version}/img/champion/${championName}.png`,
    gameMode: QUEUE_LABELS[game.gameMode as unknown as number] ?? game.gameMode,
    gameLengthSeconds: game.gameLength,
  };
};

export { QUEUE_LABELS };
export const getLolMatches = loadLolMatches;
export const getLolLiveGame = loadLolLiveGame;
