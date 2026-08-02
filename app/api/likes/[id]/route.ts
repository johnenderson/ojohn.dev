import { NextResponse } from 'next/server';

import { getArticleLikesIds } from '@/features/articles/lib/articles';
import {
  checkLikesRateLimit,
  getLikes,
  incrementLikes,
  isRedisConfigured,
} from '@/lib/redis';
import { getClientIp } from '@/lib/request';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

const noStore = { headers: { 'Cache-Control': 'no-store' } };

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// Whitelist: só aceitamos ids que correspondem a um artigo real. Bloqueia a
// criação de chaves arbitrárias no Redis (storage/cota) por ids inventados.
const isKnownArticle = (id: string) =>
  ID_PATTERN.test(id) && getArticleLikesIds().has(id);

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!isKnownArticle(id)) {
    return NextResponse.json({ count: null }, { ...noStore, status: 404 });
  }

  // Likes desativado (sem Redis) — count null faz o widget não renderizar.
  if (!isRedisConfigured()) {
    return NextResponse.json({ count: null }, noStore);
  }

  const count = await getLikes(id);
  return NextResponse.json({ count }, noStore);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  if (!isKnownArticle(id)) {
    return NextResponse.json({ count: null }, { ...noStore, status: 404 });
  }

  if (!isRedisConfigured()) {
    return NextResponse.json({ count: null }, noStore);
  }

  const allowed = await checkLikesRateLimit(getClientIp(request));
  if (!allowed) {
    return NextResponse.json(
      { count: null, error: 'rate_limited' },
      { ...noStore, status: 429 },
    );
  }

  const count = await incrementLikes(id);
  return NextResponse.json({ count }, noStore);
}
