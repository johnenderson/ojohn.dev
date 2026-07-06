import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Singleton — reutilizado entre invocações do mesmo processo.
// @upstash/redis usa HTTP internamente, então não há "conexão" persistente:
// cada chamada é uma requisição REST independente, ideal para serverless.
let _redis: Redis | null = null;

export const getRedis = (): Redis | null => {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  _redis = new Redis({ url, token });
  return _redis;
};

/** True se o Upstash estiver configurado. Usado para esconder o widget de likes. */
export const isRedisConfigured = (): boolean => getRedis() !== null;

// --- Likes nos artigos -------------------------------------------------------
// IMPORTANTE: likes são DURÁVEIS. As chaves abaixo são persistentes — NUNCA
// recebem TTL. Não use cacheSet() para likes (ele força { ex }). Detalhes e
// regras em docs/article-likes.md.

const LIKES_PREFIX = 'likes:';

/** Lê a contagem de likes de um artigo. Retorna 0 se inexistente ou sem Redis. */
export const getLikes = async (id: string): Promise<number> => {
  const redis = getRedis();
  if (!redis) return 0;
  try {
    return (await redis.get<number>(`${LIKES_PREFIX}${id}`)) ?? 0;
  } catch {
    return 0;
  }
};

/** Incrementa atômico (INCR) e retorna o novo total. Chave persistente, sem TTL. */
export const incrementLikes = async (id: string): Promise<number> => {
  const redis = getRedis();
  if (!redis) return 0;
  try {
    return await redis.incr(`${LIKES_PREFIX}${id}`);
  } catch {
    return 0;
  }
};

// --- Reações por seção ------------------------------------------------------
// Assim como os likes, as reações são DURÁVEIS: um hash por artigo, sem TTL.
// Campo do hash: `<headingSlug>:<reactionId>` (slug nunca contém ':').

const REACTIONS_PREFIX = 'reactions:';

/**
 * Lê todas as reações de um artigo como o hash cru
 * (`{ "<slug>:<reactionId>": count }`). Vazio se inexistente ou sem Redis.
 */
export const getReactionFields = async (
  id: string,
): Promise<Record<string, number>> => {
  const redis = getRedis();
  if (!redis) return {};
  try {
    return (
      (await redis.hgetall<Record<string, number>>(
        `${REACTIONS_PREFIX}${id}`,
      )) ?? {}
    );
  } catch {
    return {};
  }
};

/** Incrementa atômico (HINCRBY) uma reação e retorna o novo total do campo. */
export const incrementReaction = async (
  id: string,
  field: string,
): Promise<number> => {
  const redis = getRedis();
  if (!redis) return 0;
  try {
    return await redis.hincrby(`${REACTIONS_PREFIX}${id}`, field, 1);
  } catch {
    return 0;
  }
};

// Rate limit + proteção de tráfego (likes e reações) — biblioteca oficial
// @upstash/ratelimit. Combina dois mecanismos automáticos (sem monitoramento):
//   1. Janela deslizante por IP — contém floods/abuso de volume.
//   2. enableProtection — bloqueia IPs maliciosos da Auto IP Deny List do
//      Upstash (30+ listas de abuso open-source, atualizada diariamente).
// analytics: registra permitidos/bloqueados no Ratelimit Dashboard
// (console.upstash.com/ratelimit). Exige await pending para sincronizar.
// As chaves rl:* SÃO efêmeras (geridas pela lib), ao contrário das de
// like/reação. ephemeralCache bloqueia em memória um IP já barrado, sem ir
// ao Redis. fail-open: erro/ausência de Redis não bloqueia o fluxo.
const _limiters = new Map<string, Ratelimit>();

const getRateLimiter = (prefix: string, tokens: number): Ratelimit | null => {
  const existing = _limiters.get(prefix);
  if (existing) return existing;

  const redis = getRedis();
  if (!redis) return null;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, '60 s'),
    prefix,
    ephemeralCache: new Map(),
    enableProtection: true,
    analytics: true,
  });
  _limiters.set(prefix, limiter);
  return limiter;
};

const checkRateLimit = async (
  limiter: Ratelimit | null,
  ip: string,
): Promise<boolean> => {
  if (!limiter) return true;
  try {
    // O 1º arg (identifier) conta o rate por IP; o { ip } é checado contra a
    // deny list. await pending garante o refresh diário em background.
    const { success, pending } = await limiter.limit(ip, { ip });
    await pending;
    return success;
  } catch {
    return true;
  }
};

/**
 * True se o IP está liberado. Bloqueia (false) quando estoura a janela
 * deslizante OU quando o IP está na Auto IP Deny List do Upstash.
 */
export const checkLikesRateLimit = (ip: string): Promise<boolean> =>
  checkRateLimit(getRateLimiter('rl:likes', 30), ip);

/**
 * Rate limit das reações — janela maior que a dos likes porque um leitor
 * legítimo pode reagir a várias seções (3 emojis × N seções) em sequência.
 */
export const checkReactionsRateLimit = (ip: string): Promise<boolean> =>
  checkRateLimit(getRateLimiter('rl:reactions', 60), ip);

/** Lê um valor cacheado. Retorna null se inexistente ou se o Redis não estiver configurado. */
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch {
    return null;
  }
};

/** Salva um valor com TTL em segundos. Silencia erros para não quebrar o fluxo principal. */
export const cacheSet = async <T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> => {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // Cache miss silencioso — a aplicação continua sem cache.
  }
};
