import type { ReactNode } from 'react';

export const SectionIcon = ({ children }: { children: ReactNode }) => (
  <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-site-primary bg-site-primary-soft text-site-primary lg:size-12">
    {children}
  </span>
);
