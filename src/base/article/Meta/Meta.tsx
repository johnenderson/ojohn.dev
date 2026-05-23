import { FC } from 'react';

import { AlternativeArticle } from '@/base/article/AlternativeArticle';
import { ArticleAlternative } from '@/features/articles/lib/articles';

type MetaPropTypes = {
  date: string;
  alternativeArticle?: ArticleAlternative;
  minutes: number;
  tags: string[];
};

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

function formatDate(raw: string): string {
  // If already DD/MM/YYYY, return as-is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  // If YYYY-MM-DD, convert to DD/MM/YYYY
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return raw;
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
            <time dateTime={`${date}T00:00:00.000Z`} itemProp="datePublished">
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
