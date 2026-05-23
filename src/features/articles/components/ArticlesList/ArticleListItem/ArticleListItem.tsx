import Link from 'next/link';
import { FC } from 'react';

type PostPropType = {
  datetime: string;
  description: string;
  icon?: string;
  link: string;
  minutes: number;
  tags: string[];
  title: string;
};

export const ArticleListItem: FC<PostPropType> = ({
  datetime,
  description,
  icon,
  link,
  minutes,
  tags,
  title,
}) => (
  <li>
    <Link
      href={link}
      className="interactive-card group block rounded-md border border-site-border-muted bg-site-card p-5 no-underline focus-visible:outline-none"
      aria-label={`Ler ${title}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-site-body-muted">
        {icon ? (
          <span className="mr-0.5 text-base leading-none text-site-primary">
            {icon}
          </span>
        ) : null}
        <time>{datetime}</time>
        <span>{minutes} min de leitura</span>
      </div>

      <h3 className="m-0 text-lg font-bold leading-snug text-site-foreground transition-colors group-hover:text-site-primary-hover group-focus-visible:text-site-primary-hover">
        {title}
      </h3>

      <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-site-body">
        {description}
      </p>

      {tags.length > 0 && (
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
    </Link>
  </li>
);
