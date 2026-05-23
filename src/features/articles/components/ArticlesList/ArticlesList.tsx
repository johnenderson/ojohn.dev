import Link from 'next/link';
import { FC } from 'react';

import { ArticleListItem } from './ArticleListItem';
import { Title } from '@/base/components/Title';
import { getArticlesList } from '@/features/articles/lib/articles';

type Header = 'h1' | 'h2' | false;
type ArticlesListProps = { header?: Header };

export const ArticlesList: FC<ArticlesListProps> = ({ header = 'h2' }) => {
  const articles = getArticlesList();

  return (
    <section id="articles" className={header === false ? 'mt-8' : 'mt-20'}>
      {header === false ? null : header === 'h1' ? (
        <Title text="artigos" />
      ) : (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-2xl font-bold tracking-normal text-site-foreground sm:text-3xl">
            Artigos recentes
          </h2>
          <Link
            href="/writings"
            passHref
            className="text-sm font-medium text-site-body-muted no-underline transition-colors hover:text-site-primary-hover"
          >
            Ver todos
          </Link>
        </div>
      )}
      <ul className="m-0 grid list-none gap-3 p-0">
        {articles.map((article) => (
          <ArticleListItem
            key={article.slug}
            datetime={article.date}
            description={article.description}
            icon={article.icon}
            link={`/${article.slug}`}
            minutes={article.minutes}
            tags={article.tags}
            title={article.title}
          />
        ))}
      </ul>
    </section>
  );
};
