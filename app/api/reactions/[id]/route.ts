import { NextResponse } from 'next/server';

import {
  getArticleLikesIds,
  getArticleSectionSlugs,
} from '@/features/articles/lib/articles';
import { ArticleReactions, isReactionId } from '@/lib/reactions';
import {
  checkReactionsRateLimit,
  getReactionFields,
  incrementReaction,
  isRedisConfigured,
} from '@/lib/redis';
import { getClientIp } from '@/lib/request';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

const noStore = { headers: { 'Cache-Control': 'no-store' } };

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// Whitelist: só artigos reais (mesma proteção da API de likes).
const isKnownArticle = (id: string) =>
  ID_PATTERN.test(id) && getArticleLikesIds().has(id);

/** Converte o hash cru (`"<slug>:<reactionId>" → n`) no shape por seção. */
const toArticleReactions = (
  fields: Record<string, number>,
): ArticleReactions => {
  const reactions: ArticleReactions = {};

  for (const [field, count] of Object.entries(fields)) {
    const separator = field.lastIndexOf(':');
    if (separator === -1) continue;

    const slug = field.slice(0, separator);
    const reaction = field.slice(separator + 1);
    if (!isReactionId(reaction) || Number(count) <= 0) continue;

    reactions[slug] = { ...reactions[slug], [reaction]: Number(count) };
  }

  return reactions;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!isKnownArticle(id)) {
    return NextResponse.json({ reactions: null }, { ...noStore, status: 404 });
  }

  // Reações desativadas (sem Redis) — null faz o widget não renderizar.
  if (!isRedisConfigured()) {
    return NextResponse.json({ reactions: null }, noStore);
  }

  const fields = await getReactionFields(id);
  return NextResponse.json({ reactions: toArticleReactions(fields) }, noStore);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  if (!isKnownArticle(id)) {
    return NextResponse.json({ count: null }, { ...noStore, status: 404 });
  }

  if (!isRedisConfigured()) {
    return NextResponse.json({ count: null }, noStore);
  }

  let body: { slug?: unknown; reaction?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ count: null }, { ...noStore, status: 400 });
  }

  const { slug, reaction } = body;

  // Whitelist dupla: a reação precisa existir e o slug precisa ser um h2 real
  // do artigo — bloqueia a criação de campos arbitrários no hash do Redis.
  if (
    typeof reaction !== 'string' ||
    !isReactionId(reaction) ||
    typeof slug !== 'string' ||
    !getArticleSectionSlugs(id).has(slug)
  ) {
    return NextResponse.json({ count: null }, { ...noStore, status: 400 });
  }

  const allowed = await checkReactionsRateLimit(getClientIp(request));
  if (!allowed) {
    return NextResponse.json(
      { count: null, error: 'rate_limited' },
      { ...noStore, status: 429 },
    );
  }

  const count = await incrementReaction(id, `${slug}:${reaction}`);
  return NextResponse.json({ count }, noStore);
}
