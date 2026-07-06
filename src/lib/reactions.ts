/**
 * Reações disponíveis por seção de artigo. Os ids são as chaves canônicas
 * usadas no Redis e na API — o emoji é só apresentação. Não renomeie um id
 * depois de publicado, ou as contagens já gravadas ficam órfãs.
 */
export const REACTIONS = [
  { id: 'up', emoji: '👍', label: 'Gostei desta seção' },
  { id: 'fire', emoji: '🔥', label: 'Seção excelente' },
  { id: 'mind', emoji: '🤯', label: 'Mente explodida' },
] as const;

export type ReactionId = typeof REACTIONS[number]['id'];

export const REACTION_IDS = new Set<string>(REACTIONS.map((r) => r.id));

export const isReactionId = (value: string): value is ReactionId =>
  REACTION_IDS.has(value);

/** Contagens de uma seção: { up: 2, fire: 1, ... } (chaves ausentes = 0). */
export type SectionCounts = Partial<Record<ReactionId, number>>;

/** Contagens do artigo inteiro, indexadas pelo slug da seção. */
export type ArticleReactions = Record<string, SectionCounts>;
