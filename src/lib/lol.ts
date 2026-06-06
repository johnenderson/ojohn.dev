import { cacheGet, cacheSet } from './redis';

// Regiões da Riot API
const RIOT_REGIONAL = 'https://americas.api.riotgames.com'; // roteamento continental
const RIOT_PLATFORM = 'https://br1.api.riotgames.com'; // servidor do jogo (BR)
const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';

const CACHE_TTL_RANKED = 60 * 60 * 6; // 6h — elo muda com frequência
const CACHE_TTL_CHAMPIONS = 60 * 60 * 24; // 24h — maestria muda menos
const CACHE_TTL_VERSION = 60 * 60 * 24 * 7; // 7d — versão do patch

const CACHE_KEY_RANKED = 'lol:ranked:v3';
const CACHE_KEY_CHAMPIONS = 'lol:champions:v2';
const CACHE_KEY_VERSION = 'lol:ddragon-version:v2';
const CACHE_KEY_IDENTITY = 'lol:identity:v3'; // puuid + iconId — v3: invalidate after API key rotation
const CACHE_TTL_IDENTITY = 60 * 60 * 24 * 30; // 30d — muda só se trocar de nick

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
      `${RIOT_PLATFORM}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=5`,
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
    .filter((c): c is LolChampion => c !== null);

  if (topChampions.length > 0) {
    await cacheSet(CACHE_KEY_CHAMPIONS, topChampions, CACHE_TTL_CHAMPIONS);
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
