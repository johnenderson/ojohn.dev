import Link from 'next/link';
import { FC } from 'react';

import { ArticleNavigation as ArticleNavigationType } from '@/features/articles/lib/articles';

type ArticleNavigationProps = {
  navigation: ArticleNavigationType;
};

const NavigationCard = ({
  article,
  eyebrow,
}: {
  article: NonNullable<ArticleNavigationType['older']>;
  eyebrow: string;
}) => (
  <Link
    href={`/${article.slug}`}
    className="interactive-card article-card-glass group block rounded-md border border-site-border-muted p-4 no-underline focus-visible:outline-none"
  >
    <div className="article-card-content flex items-start gap-3">
      {article.icon ? (
        <span className="mt-1 shrink-0 text-base leading-none text-site-primary">
          {article.icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-site-body-muted">
          {eyebrow}
        </p>
        <p className="mb-0 mt-2 text-base font-bold leading-snug text-site-foreground transition-colors group-hover:text-site-primary-hover group-focus-visible:text-site-primary-hover">
          {article.title}
        </p>
        <p className="mb-0 mt-2 line-clamp-2 text-sm leading-6 text-site-body">
          {article.description}
        </p>
      </div>
    </div>
  </Link>
);

export const ArticleNavigation: FC<ArticleNavigationProps> = ({
  navigation,
}) => {
  const hasRelatedArticles = Boolean(navigation.newer || navigation.older);

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
          href="/writings"
          className="text-sm font-medium text-site-body-muted no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
        >
          Voltar para o Blog
        </Link>
      </div>
      {hasRelatedArticles ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {navigation.newer ? (
            <NavigationCard article={navigation.newer} eyebrow="Mais recente" />
          ) : null}
          {navigation.older ? (
            <NavigationCard article={navigation.older} eyebrow="Anterior" />
          ) : null}
        </div>
      ) : null}
    </nav>
  );
};
