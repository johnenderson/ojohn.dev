import Link from 'next/link';
import { FC } from 'react';

type PostPropType = {
  datetime: string;
  description: string;
  icon?: string;
  link: string;
  minutes: number;
  showTags?: boolean;
  tags: string[];
  title: string;
  variant?: 'default' | 'compact';
};

export const ArticleListItem: FC<PostPropType> = ({
  datetime,
  description,
  icon,
  link,
  minutes,
  showTags = true,
  tags,
  title,
  variant = 'default',
}) => {
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <li>
        <Link
          href={link}
          className="interactive-card article-card-glass group block rounded-md border border-site-border-muted p-4 no-underline focus-visible:outline-none sm:p-5"
        >
          <div className="article-card-content flex items-start gap-4">
            {icon ? (
              <span className="mt-1 shrink-0 text-xl leading-none text-site-primary">
                {icon}
              </span>
            ) : null}

            <div className="min-w-0 flex-1">
              <h3 className="m-0 text-lg font-bold leading-snug text-site-foreground transition-colors group-hover:text-site-primary-hover group-focus-visible:text-site-primary-hover">
                {title}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-site-body-muted">
                <time>{datetime}</time>
                <span>{minutes} min de leitura</span>
              </div>

              <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-site-body">
                {description}
              </p>
            </div>
          </div>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={link}
        className="interactive-card article-card-glass group block rounded-md border border-site-border-muted p-5 no-underline focus-visible:outline-none"
      >
        <div className="article-card-content">
          <div className="flex items-start gap-2">
            {icon ? (
              <span className="mt-1 shrink-0 text-base leading-none text-site-primary">
                {icon}
              </span>
            ) : null}
            <h3 className="m-0 text-lg font-bold leading-snug text-site-foreground transition-colors group-hover:text-site-primary-hover group-focus-visible:text-site-primary-hover">
              {title}
            </h3>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-site-body-muted">
            <time>{datetime}</time>
            <span>{minutes} min de leitura</span>
          </div>

          <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-site-body">
            {description}
          </p>

          {showTags && tags.length > 0 && (
            <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
              {tags.slice(0, 4).map((tag) => (
                <li
                  key={tag}
                  className="rounded border border-site-border-subtle bg-site-primary-soft px-2 py-0.5 text-xs font-medium leading-5 text-site-body transition-colors group-hover:border-site-border group-hover:text-site-foreground light:bg-white"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Link>
    </li>
  );
};
