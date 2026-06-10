import Link from 'next/link';
import { FC } from 'react';

import { Card } from '@/base/components/Card';
import { ArticleNavigation as ArticleNavigationType } from '@/features/articles/lib/articles';

type ArticleNavigationProps = {
  navigation: ArticleNavigationType;
};

type Direction = 'newer' | 'older';

const Chevron = ({ direction }: { direction: Direction }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {direction === 'older' ? (
      <polyline points="15 18 9 12 15 6" />
    ) : (
      <polyline points="9 18 15 12 9 6" />
    )}
  </svg>
);

const NavigationCard = ({
  article,
  direction,
}: {
  article: NonNullable<ArticleNavigationType['older']>;
  direction: Direction;
}) => {
  const eyebrow = direction === 'newer' ? 'Mais recente' : 'Anterior';

  return (
    <Card
      href={`/blog/${article.slug}`}
      interactive
      className="article-card-glass group flex h-full flex-col p-5 focus-visible:outline-none"
    >
      <div className="article-card-content flex h-full flex-col">
        <p className="m-0 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-site-body-muted">
          {direction === 'older' ? (
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
              <Chevron direction="older" />
            </span>
          ) : null}
          {eyebrow}
          {direction === 'newer' ? (
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              <Chevron direction="newer" />
            </span>
          ) : null}
        </p>

        <div className="mt-3 flex items-start gap-3">
          {article.icon ? (
            <span className="mt-0.5 shrink-0 text-base leading-none text-site-primary">
              {article.icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="m-0 text-base font-bold leading-snug text-site-foreground transition-colors group-hover:text-site-primary-hover group-focus-visible:text-site-primary-hover">
              {article.title}
            </p>
            <p className="mb-0 mt-2 line-clamp-2 text-sm leading-6 text-site-body-muted">
              {article.description}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const ArticleNavigation: FC<ArticleNavigationProps> = ({
  navigation,
}) => {
  const related = [
    navigation.newer
      ? { article: navigation.newer, direction: 'newer' as const }
      : null,
    navigation.older
      ? { article: navigation.older, direction: 'older' as const }
      : null,
  ].filter((entry) => entry !== null);

  if (related.length === 0) {
    return (
      <nav
        aria-label="Navegação entre artigos"
        className="mt-8 border-t border-site-border-subtle pt-4"
      >
        <Link
          href="/blog"
          className="inline-flex text-sm font-medium text-site-body-muted no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-primary"
        >
          Voltar para o Blog
        </Link>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Navegação entre artigos"
      className="mt-14 border-t border-site-border-muted pt-8"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="m-0 text-xl font-bold text-site-foreground">
          Continue lendo
        </p>
        <Link
          href="/blog"
          className="text-sm font-medium text-site-body-muted no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
        >
          Voltar para o Blog
        </Link>
      </div>
      <div
        className={`grid gap-3 ${related.length === 2 ? 'sm:grid-cols-2' : ''}`}
      >
        {related.map(({ article, direction }) => (
          <NavigationCard
            key={article.slug}
            article={article}
            direction={direction}
          />
        ))}
      </div>
    </nav>
  );
};
