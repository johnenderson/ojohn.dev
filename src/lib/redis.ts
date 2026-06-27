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
