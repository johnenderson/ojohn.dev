import { FC } from 'react';

import { ArticleIcon } from '@/base/article/ArticleIcon/ArticleIcon';
import { Card } from '@/base/components/Card';

function formatDate(raw: string): string {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) return raw.replaceAll('-', '/');
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return raw;
}

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

const TagList = ({ tags }: { tags: string[] }) => (
  <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
    {tags.slice(0, 4).map((tag) => (
      <li
        key={tag}
        className="rounded border border-site-border-subtle bg-site-primary-soft px-2 py-0.5 text-xs font-medium leading-5 text-site-body transition-colors group-hover:border-site-border group-hover:text-site-foreground light:bg-white"
      >
        {tag}
      </li>
    ))}
  </ul>
);

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
  const formattedDate = formatDate(datetime);

  if (isCompact) {
    return (
      <li>
        <Card
          href={link}
          interactive
          className="article-card-glass group p-4 focus-visible:outline-none sm:p-5"
        >
          <div className="article-card-content flex items-center gap-4">
            {icon ? <ArticleIcon icon={icon} size="card" /> : null}

            <div className="min-w-0 flex-1">
              <h3 className="m-0 text-lg font-bold leading-snug text-site-foreground transition-colors group-hover:text-site-primary-hover group-focus-visible:text-site-primary-hover">
                {title}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-site-body-muted">
                <time dateTime={datetime}>{formattedDate}</time>
                <span>{minutes} min de leitura</span>
              </div>

              <p className="mb-0 mt-1.5 line-clamp-2 text-xs leading-5 text-site-body-muted">
                {description}
              </p>

              {showTags && tags.length > 0 && <TagList tags={tags} />}
            </div>
          </div>
        </Card>
      </li>
    );
  }

  return (
    <li>
      <Card
        href={link}
        interactive
        className="article-card-glass group p-5 focus-visible:outline-none"
      >
        <div className="article-card-content">
          <div className="flex items-start gap-2">
            {icon ? <ArticleIcon icon={icon} size="sm" /> : null}
            <h3 className="m-0 text-lg font-bold leading-snug text-site-foreground transition-colors group-hover:text-site-primary-hover group-focus-visible:text-site-primary-hover">
              {title}
            </h3>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-site-body-muted">
            <time dateTime={datetime}>{formattedDate}</time>
            <span>{minutes} min de leitura</span>
          </div>

          <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-site-body">
            {description}
          </p>

          {showTags && tags.length > 0 && <TagList tags={tags} />}
        </div>
      </Card>
    </li>
  );
};
