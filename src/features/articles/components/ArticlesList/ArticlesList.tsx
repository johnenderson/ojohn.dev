import Link from 'next/link';
import { FC } from 'react';

import { faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ArticleListItem } from './ArticleListItem';
import {
  SECTION_ACTION_CLASS,
  SectionHeader,
} from '@/base/components/SectionHeader';
import { Title } from '@/base/components/Title';
import {
  ArticleListItem as ArticleListItemType,
  getArticlesList,
  parseArticleDate,
} from '@/features/articles/lib/articles';

type Header = 'h1' | 'h2' | false;
type ArticlesListProps = {
  /** Destaca o primeiro artigo (capa grande). */
  featureFirst?: boolean;
  filterTag?: string;
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

export const ArticlesList: FC<ArticlesListProps> = ({
  featureFirst = false,
  filterTag,
  grouped = false,
  header = 'h2',
  itemVariant = 'default',
  showTags = true,
}) => {
  const articles = getArticlesList().filter(
    (article) => !filterTag || article.tags.includes(filterTag),
  );
  // Na lista agrupada, o destaque sai dos grupos para não aparecer duas vezes.
  const highlighted = grouped && featureFirst ? articles[0] : undefined;
  const articlesByYear = groupArticlesByYear(
    highlighted ? articles.slice(1) : articles,
  );
  const years = Object.keys(articlesByYear).sort(
    (a, b) => Number(b) - Number(a),
  );

  const toItemProps = (article: ArticleListItemType) => ({
    cover: article.cover,
    datetime: article.date,
    description: article.description,
    icon: article.icon,
    link: `/blog/${article.slug}`,
    minutes: article.minutes,
    showTags,
    tags: article.tags,
    title: article.title,
  });

  let headerContent: React.ReactNode = null;
  if (header !== false) {
    headerContent =
      header === 'h1' ? (
        <Title text="artigos" />
      ) : (
        <SectionHeader
          icon={
            <FontAwesomeIcon
              icon={faNewspaper}
              aria-hidden="true"
              className="size-4"
            />
          }
          title="Artigos recentes"
          action={
            <Link href="/blog" className={SECTION_ACTION_CLASS}>
              Ver todos →
            </Link>
          }
        />
      );
  }

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

      {articles.length === 0 && (
        <p className="m-0 text-sm text-site-body-muted">
          Nenhum artigo encontrado
          {filterTag ? ` com a tag "${filterTag}"` : ''}.
        </p>
      )}

      {grouped ? (
        <div className="flex flex-col gap-10">
          {highlighted ? (
            <ul className="m-0 grid list-none p-0">
              <ArticleListItem {...toItemProps(highlighted)} variant="hero" />
            </ul>
          ) : null}

          {years.map((year) => (
            <section key={year} aria-labelledby={`articles-${year}`}>
              <h2
                id={`articles-${year}`}
                className="m-0 mb-4 flex items-center gap-4 font-mono text-sm font-medium tracking-wider text-site-body-muted after:h-px after:flex-1 after:bg-site-border-muted"
              >
                {year}
              </h2>
              <ul className="m-0 grid list-none gap-3 p-0">
                {articlesByYear[year].map((article) => (
                  <ArticleListItem
                    key={article.slug}
                    {...toItemProps(article)}
                    variant={itemVariant}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {articles.map((article, index) => (
            <ArticleListItem
              key={article.slug}
              {...toItemProps(article)}
              variant={featureFirst && index === 0 ? 'feature' : itemVariant}
            />
          ))}
        </ul>
      )}
    </section>
  );
};
