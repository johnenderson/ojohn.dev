import Link from 'next/link';
import { FC } from 'react';

import { ArticleNavigation as ArticleNavigationType } from '@/features/articles/lib/articles';

type ArticleNavigationProps = {
  navigation: ArticleNavigationType;
};

type Direction = 'newer' | 'older';

const Chevron = ({ direction }: { direction: Direction }) => (
  <svg
    width="15"
    height="15"
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

const NavigationLink = ({
  article,
  direction,
}: {
  article: NonNullable<ArticleNavigationType['older']>;
  direction: Direction;
}) => {
  const eyebrow = direction === 'newer' ? 'Mais recente' : 'Anterior';

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group -mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 no-underline transition-colors hover:bg-site-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-primary"
    >
      {direction === 'older' ? (
        <span className="shrink-0 text-site-body-muted transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-site-primary">
          <Chevron direction="older" />
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-site-body-muted">
          {eyebrow}
        </span>
        <span className="block truncate text-[15px] font-semibold leading-snug text-site-foreground transition-colors group-hover:text-site-primary-hover">
          {article.title}
        </span>
      </span>

      {direction === 'newer' ? (
        <span className="shrink-0 text-site-body-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-site-primary">
          <Chevron direction="newer" />
        </span>
      ) : null}
    </Link>
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
      className="mt-12 border-t border-site-border-subtle pt-6"
    >
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="m-0 text-sm font-semibold text-site-body-muted">
          Continue lendo
        </p>
        <Link
          href="/blog"
          className="text-sm font-medium text-site-body-muted no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
        >
          Voltar para o Blog
        </Link>
      </div>
      <div className="flex flex-col">
        {related.map(({ article, direction }) => (
          <NavigationLink
            key={article.slug}
            article={article}
            direction={direction}
          />
        ))}
      </div>
    </nav>
  );
};
