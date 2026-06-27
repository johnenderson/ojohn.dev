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

// Rate limit + proteção de tráfego dos likes — biblioteca oficial
// @upstash/ratelimit. Combina dois mecanismos automáticos (sem monitoramento):
//   1. Janela deslizante (30/60s por IP) — contém floods/abuso de volume.
//   2. enableProtection — bloqueia IPs maliciosos da Auto IP Deny List do
//      Upstash (30+ listas de abuso open-source, atualizada diariamente).
// As chaves rl:likes:* SÃO efêmeras (geridas pela lib), ao contrário das de
// like. ephemeralCache bloqueia em memória um IP já barrado, sem ir ao Redis.
// fail-open: erro/ausência de Redis não bloqueia o fluxo de likes.
let _ratelimit: Ratelimit | null = null;

const getRateLimiter = (): Ratelimit | null => {
  if (_ratelimit) return _ratelimit;

  const redis = getRedis();
  if (!redis) return null;

  _ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '60 s'),
    prefix: 'rl:likes',
    ephemeralCache: new Map(),
    enableProtection: true,
  });
  return _ratelimit;
};

/**
 * True se o IP está liberado. Bloqueia (false) quando estoura a janela
 * deslizante OU quando o IP está na Auto IP Deny List do Upstash.
 */
export const checkLikesRateLimit = async (ip: string): Promise<boolean> => {
  const limiter = getRateLimiter();
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
