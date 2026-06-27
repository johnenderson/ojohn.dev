import { NextResponse } from 'next/server';

import { getLikes, incrementLikes, isRedisConfigured } from '@/lib/redis';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

const noStore = { headers: { 'Cache-Control': 'no-store' } };

// Mesma forma aceita no frontmatter (likesId). Limita o namespace de chaves
// que um POST pode criar no Redis.
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

const isValidId = (id: string) => ID_PATTERN.test(id);

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ count: null }, { ...noStore, status: 400 });
  }

  // Likes desativado (sem Redis) — count null faz o widget não renderizar.
  if (!isRedisConfigured()) {
    return NextResponse.json({ count: null }, noStore);
  }

  const count = await getLikes(id);
  return NextResponse.json({ count }, noStore);
}

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ count: null }, { ...noStore, status: 400 });
  }

  if (!isRedisConfigured()) {
    return NextResponse.json({ count: null }, noStore);
  }

  const count = await incrementLikes(id);
  return NextResponse.json({ count }, noStore);
}
