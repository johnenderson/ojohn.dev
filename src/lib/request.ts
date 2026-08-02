/**
 * IP do cliente para rate limiting. Na Vercel o x-forwarded-for é controlado
 * pela plataforma (não spoofável); atrás de outro proxy, reavalie a confiança
 * no primeiro valor da lista.
 */
export const getClientIp = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
};
