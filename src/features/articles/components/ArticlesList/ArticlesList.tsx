import Link from 'next/link';
import { FC } from 'react';

import { ArticleListItem } from './ArticleListItem';
import { Title } from '@/base/components/Title';
import {
  ArticleListItem as ArticleListItemType,
  getArticlesList,
  parseArticleDate,
} from '@/features/articles/lib/articles';

type Header = 'h1' | 'h2' | false;
type ArticlesListProps = {
  grouped?: boolean;
  header?: Header;
  itemVariant?: 'default' | 'compact';
  showTags?: boolean;
};

const getArticleYear = (date: string) => {
  return parseArticleDate(date).getUTCFullYear().toString();
};

const groupArticlesByYear = (articles: ArticleListItemType[]) =>
  articles.reduce<Record<string, ArticleListItemType[]>>((groups, article) => {
    const year = getArticleYear(article.date);

    return {
      ...groups,
      [year]: [...(groups[year] ?? []), article],
    };
  }, {});

const formatArticleCount = (count: number) =>
  count === 1 ? '1 artigo' : `${count} artigos`;

export const ArticlesList: FC<ArticlesListProps> = ({
  grouped = false,
  header = 'h2',
  itemVariant = 'default',
  showTags = true,
}) => {
  const articles = getArticlesList();
  const articlesByYear = groupArticlesByYear(articles);
  const years = Object.keys(articlesByYear).sort(
    (a, b) => Number(b) - Number(a),
  );
  const tags = Array.from(
    new Set(articles.flatMap((article) => article.tags)),
  ).sort((a, b) => a.localeCompare(b));

  let headerContent: React.ReactNode = null;
  if (header !== false) {
    headerContent =
      header === 'h1' ? (
        <Title text="artigos" />
      ) : (
        <div className="mb-4">
          <h2 className="m-0 text-2xl font-bold tracking-normal text-site-foreground sm:text-3xl">
            Artigos recentes
          </h2>
        </div>
      );
  }

  const showVerTodos = header === 'h2';

  return (
    <section
      id="articles"
      className={
        header === false
          ? 'mt-8'
          : 'mt-12 border-t border-site-border-subtle pt-12 md:mt-14 md:pt-14'
      }
    >
      {headerContent}

      {grouped ? (
        <div className="flex flex-col gap-12">
          <div className="flex flex-wrap items-center gap-2 text-sm text-site-body-muted">
            <span>{formatArticleCount(articles.length)}</span>
            {tags.length > 0 ? (
              <>
                <span className="text-site-border">•</span>
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded border border-site-border-subtle px-2 py-0.5 text-xs font-medium leading-5"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          {years.map((year) => (
            <section key={year} aria-labelledby={`articles-${year}`}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <h2
                  id={`articles-${year}`}
                  className="m-0 text-3xl font-bold leading-none text-site-foreground"
                >
                  {year}
                </h2>
                <span className="text-sm font-medium text-site-body-muted">
                  {formatArticleCount(articlesByYear[year].length)}
                </span>
              </div>
              <ul className="m-0 grid list-none gap-3 p-0">
                {articlesByYear[year].map((article) => (
                  <ArticleListItem
                    key={article.slug}
                    datetime={article.date}
                    description={article.description}
                    icon={article.icon}
                    link={`/${article.slug}`}
                    minutes={article.minutes}
                    showTags={showTags}
                    tags={article.tags}
                    title={article.title}
                    variant={itemVariant}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {articles.map((article) => (
            <ArticleListItem
              key={article.slug}
              datetime={article.date}
              description={article.description}
              icon={article.icon}
              link={`/${article.slug}`}
              minutes={article.minutes}
              showTags={showTags}
              tags={article.tags}
              title={article.title}
              variant={itemVariant}
            />
          ))}
        </ul>
      )}

      {showVerTodos && (
        <div className="mt-4 flex justify-end">
          <Link
            href="/writings"
            passHref
            className="text-sm font-medium text-site-body-muted no-underline transition-colors hover:text-site-primary-hover"
          >
            Ver todos →
          </Link>
        </div>
      )}
    </section>
  );
};
