import type { ReactNode } from 'react';

/**
 * Selo do ícone que abre toda seção do site. Tamanho único de propósito —
 * o padrão de header é o mesmo na home, /now, /me e /uses.
 */
export const SectionIcon = ({ children }: { children: ReactNode }) => (
  <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-site-primary bg-site-primary-soft text-site-primary">
    {children}
  </span>
);
