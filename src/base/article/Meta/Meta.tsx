import Link from 'next/link';
import { FC } from 'react';

import { AlternativeArticle } from '@/base/article/AlternativeArticle';
import { CalendarIcon, ClockIcon } from '@/base/article/icons';
import {
  ArticleAlternative,
  formatArticleDate,
  parseArticleDate,
} from '@/features/articles/lib/articles';

type MetaPropTypes = {
  date: string;
  alternativeArticle?: ArticleAlternative;
  minutes: number;
  tags: string[];
};

function formatDateTime(raw: string): string {
  const date = parseArticleDate(raw);

  return Number.isNaN(date.getTime())
    ? raw
    : date.toISOString().slice(0, 'YYYY-MM-DD'.length);
}

export const Meta: FC<MetaPropTypes> = ({
  date,
  alternativeArticle,
  minutes,
  tags,
}) => (
  <div className="mt-1 flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-site-body-muted">
      {date && (
        <span className="flex items-center gap-1.5">
          <CalendarIcon />
          <span>
            <time dateTime={formatDateTime(date)} itemProp="datePublished">
              {formatArticleDate(date)}
            </time>
          </span>
        </span>
      )}
      {date && minutes ? (
        <span className="flex items-center gap-1.5">
          <span className="text-site-border">•</span>
          <ClockIcon />
          <strong className="font-semibold text-site-body">
            {minutes} min de leitura
          </strong>
        </span>
      ) : null}
    </div>
    {tags.length > 0 && (
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {tags.map((tag) => (
          <li key={tag}>
            <Link
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className="block rounded border border-site-border-subtle px-2 py-0.5 text-xs font-medium leading-5 text-site-body-muted no-underline transition-colors hover:border-site-primary hover:text-site-primary"
            >
              {tag}
            </Link>
          </li>
        ))}
      </ul>
    )}
    {alternativeArticle ? (
      <AlternativeArticle alternativeArticle={alternativeArticle} />
    ) : null}
  </div>
);
