import { NextResponse, type NextRequest } from 'next/server';

import { SECTION_FLAGS } from '@/lib/section-flags';

/**
 * Seções desativadas em SECTION_FLAGS devem responder 404 de verdade. O
 * `notFound()` dentro da página sai com status 200 porque o loading.tsx da
 * raiz já iniciou o stream (soft-404, e o <title> da seção ainda vazava).
 * Reescrever aqui, antes de renderizar, devolve o 404 correto.
 *
 * O matcher precisa ser literal: ao ligar/desligar uma seção com rota
 * própria, ela só entra aqui se estiver em `config.matcher`.
 */
export function proxy(request: NextRequest) {
  if (SECTION_FLAGS.uses) return NextResponse.next();

  return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
}

export const config = {
  matcher: ['/uses'],
};
