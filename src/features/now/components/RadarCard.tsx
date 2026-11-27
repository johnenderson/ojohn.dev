import type { ReactNode } from 'react';

import { Card } from '@/base/components/Card';

type RadarCardProps = {
  label: string;
  title: string;
  children: ReactNode;
  href?: string;
};

export const RadarCard = ({ label, title, children, href }: RadarCardProps) => {
  const content = (
    <>
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-site-primary">
        <span className="size-1.5 rounded-full bg-site-primary" />
        {label}
      </span>
      <h3 className="mb-0 mt-4 text-2xl font-bold leading-tight text-site-foreground">
        {title}
      </h3>
      <p className="mb-0 mt-3 text-base leading-relaxed text-site-body-muted">
        {children}
      </p>
    </>
  );

  const className =
    'h-full p-5 transition-colors hover:border-site-primary hover:bg-site-card-hover';

  if (href) {
    return (
      <Card
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        interactive
        className={className}
      >
        {content}
      </Card>
    );
  }

  return (
    <Card interactive className={className}>
      {content}
    </Card>
  );
};
