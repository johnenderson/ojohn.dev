/**
 * Animação padrão dos cards de imagem da página /now.
 *
 * Todos os cards (jogos, campeões, artistas) compartilham:
 *  - easing spring: cubic-bezier(0.22, 1, 0.36, 1)
 *  - scale: 1.04 mobile / 1.08 desktop
 *  - rotação sutil determinística via seed
 *  - tooltip via CardTooltip (@radix-ui/react-tooltip, delayDuration=300)
 *
 * A única variação intencional é a duration:
 *  - LARGE (300ms) → cards maiores, ex: capas de jogo aspect-[2/3]
 *  - SMALL (400ms) → cards quadrados menores, ex: campeões e artistas
 *    (mais lentos para compensar a percepção de velocidade em elementos pequenos)
 */

// ─── Rotação ─────────────────────────────────────────────────────────────────

const HOVER_ROTATIONS = [
  'hover:-rotate-1',
  'hover:rotate-1',
  'hover:-rotate-2',
  'hover:rotate-2',
] as const;

/**
 * Retorna a classe de rotação para um dado seed numérico.
 * Usar um identificador estável (ex: appid, index fixo) evita hydration mismatch.
 */
export const hoverRotation = (seed: number): string =>
  HOVER_ROTATIONS[
    ((seed % HOVER_ROTATIONS.length) + HOVER_ROTATIONS.length) %
      HOVER_ROTATIONS.length
  ];

// ─── Classes de hover ─────────────────────────────────────────────────────────

const CARD_HOVER_BASE =
  'transform-gpu will-change-transform transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:scale-[1.04] lg:hover:scale-[1.08]';

/** Cards grandes — ex: capas de jogo (aspect-[2/3]) */
export const CARD_HOVER_LARGE = `${CARD_HOVER_BASE} duration-300`;

/** Cards quadrados pequenos — ex: campeões, artistas */
export const CARD_HOVER_SMALL = `${CARD_HOVER_BASE} duration-[400ms]`;

// ─── Elementos auxiliares ─────────────────────────────────────────────────────

/** Anel interno sutil que simula uma borda inset nas imagens */
export const CARD_INNER_RING =
  'pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-white/[0.12]';

// Tooltip gerenciado pelo componente CardTooltip (@radix-ui/react-tooltip).
// Ver: src/features/now/components/CardTooltip.tsx
