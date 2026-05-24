import Link from 'next/link';
import type { ReactNode } from 'react';

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
      <h3 className="mb-0 mt-4 text-xl font-bold leading-tight text-site-foreground">
        {title}
      </h3>
      <p className="mb-0 mt-3 text-sm font-semibold leading-relaxed text-site-body-muted">
        {children}
      </p>
    </>
  );

  const className =
    'interactive-card block h-full rounded-md border border-site-border-muted bg-site-card p-5 no-underline transition-colors hover:border-site-primary hover:bg-site-card-hover';

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
};
