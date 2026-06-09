import { FC } from 'react';

import { AlternativeArticle } from '@/base/article/AlternativeArticle';
import { CalendarIcon, ClockIcon } from '@/base/article/icons';
import {
  ArticleAlternative,
  parseArticleDate,
} from '@/features/articles/lib/articles';

type MetaPropTypes = {
  date: string;
  alternativeArticle?: ArticleAlternative;
  minutes: number;
  tags: string[];
};

function formatDate(raw: string): string {
  // If already DD/MM/YYYY, return as-is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  // If already DD-MM-YYYY, convert to DD/MM/YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) return raw.replaceAll('-', '/');
  // If YYYY-MM-DD, convert to DD/MM/YYYY
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return raw;
}

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
              {formatDate(date)}
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
          <li
            key={tag}
            className="rounded border border-site-border-subtle px-2 py-0.5 text-xs font-medium leading-5 text-site-body-muted transition-colors hover:border-site-border hover:text-site-foreground"
          >
            {tag}
          </li>
        ))}
      </ul>
    )}
    {alternativeArticle ? (
      <AlternativeArticle alternativeArticle={alternativeArticle} />
    ) : null}
  </div>
);
