import Image from 'next/image';
import { FC } from 'react';

import { ArticleIcon } from '@/base/article/ArticleIcon/ArticleIcon';
import { CalendarIcon, ClockIcon } from '@/base/article/icons';
import { Card } from '@/base/components/Card';
import { formatArticleDate } from '@/features/articles/lib/articles';

type PostPropType = {
  cover?: string;
  datetime: string;
  description: string;
  icon?: string;
  link: string;
  minutes: number;
  showTags?: boolean;
  tags: string[];
  title: string;
  variant?: 'default' | 'compact' | 'feature' | 'hero';
};

/** Capa em destaque: empilhada no mobile, ao lado do texto a partir de md. */
const FeatureCover = ({ cover, title }: { cover: string; title: string }) => (
  <Image
    src={cover}
    alt={`Capa do artigo ${title}`}
    width={640}
    height={360}
    sizes="(min-width: 768px) 320px, 100vw"
    className="aspect-video w-full shrink-0 rounded-md border border-site-border-subtle object-cover transition-transform duration-300 group-hover:scale-[1.02] md:w-80"
  />
);

/** Capa da lista do blog: maior que a dos cards da home. */
const ListCover = ({ cover, title }: { cover: string; title: string }) => (
  <Image
    src={cover}
    alt={`Capa do artigo ${title}`}
    width={448}
    height={252}
    sizes="224px"
    className="hidden aspect-video w-56 shrink-0 self-center rounded-md border border-site-border-subtle object-cover transition-transform duration-300 group-hover:scale-[1.03] sm:block"
  />
);

const CardCover = ({ cover, title }: { cover: string; title: string }) => (
  <Image
    src={cover}
    alt={`Capa do artigo ${title}`}
    width={256}
    height={144}
    className="hidden h-24 w-40 shrink-0 self-center rounded-md border border-site-border-subtle object-cover transition-transform duration-300 group-hover:scale-[1.03] sm:block"
  />
);

const MetaLine = ({
  datetime,
  formattedDate,
  minutes,
}: {
  datetime: string;
  formattedDate: string;
  minutes: number;
}) => (
  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-site-body-muted">
    <span className="flex items-center gap-1.5">
      <CalendarIcon />
      <time dateTime={datetime}>{formattedDate}</time>
    </span>
    <span className="flex items-center gap-1.5">
      <span className="text-site-border">•</span>
      <ClockIcon />
      <span>{minutes} min de leitura</span>
    </span>
  </div>
);

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
  cover,
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
  const formattedDate = formatArticleDate(datetime);

  // Destaque do blog. A home usa 'feature', que continua como está.
  if (variant === 'hero') {
    return (
      <li>
        <Card
          href={link}
          interactive
          className="article-card-glass group p-4 focus-visible:outline-none sm:p-5"
        >
          <div
            className={`article-card-content grid gap-5 ${
              cover
                ? 'lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center lg:gap-8'
                : ''
            }`}
          >
            {cover ? (
              <Image
                src={cover}
                alt={`Capa do artigo ${title}`}
                width={1200}
                height={630}
                sizes="(min-width: 1024px) 560px, 100vw"
                loading="eager"
                fetchPriority="high"
                className="aspect-[1200/630] h-auto w-full rounded-md border border-site-border-subtle object-cover"
              />
            ) : null}

            <div className="min-w-0">
              <p className="m-0 mb-3 font-mono text-xs uppercase tracking-wider text-site-primary">
                Mais recente
              </p>
              <div className="flex items-start gap-3">
                {icon ? <ArticleIcon icon={icon} size="sm" /> : null}
                <h2 className="m-0 text-balance text-2xl font-bold leading-tight text-site-foreground transition-colors group-hover:text-site-primary group-focus-visible:text-site-primary">
                  {title}
                </h2>
              </div>

              <p className="mb-0 mt-3 text-pretty text-base leading-relaxed text-site-body">
                {description}
              </p>

              <MetaLine
                datetime={datetime}
                formattedDate={formattedDate}
                minutes={minutes}
              />

              {showTags && tags.length > 0 && <TagList tags={tags} />}
            </div>
          </div>
        </Card>
      </li>
    );
  }

  if (variant === 'feature') {
    return (
      <li>
        <Card
          href={link}
          interactive
          className="article-card-glass group p-4 focus-visible:outline-none sm:p-5"
        >
          <div className="article-card-content flex flex-col gap-5 md:flex-row md:items-center">
            {cover ? <FeatureCover cover={cover} title={title} /> : null}

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2.5">
                {icon ? <ArticleIcon icon={icon} size="sm" /> : null}
                <h3 className="m-0 text-balance text-xl font-bold leading-snug text-site-foreground transition-colors group-hover:text-site-primary group-focus-visible:text-site-primary">
                  {title}
                </h3>
              </div>

              <MetaLine
                datetime={datetime}
                formattedDate={formattedDate}
                minutes={minutes}
              />

              <p className="mb-0 mt-3 text-pretty text-sm leading-6 text-site-body">
                {description}
              </p>

              {showTags && tags.length > 0 && <TagList tags={tags} />}
            </div>
          </div>
        </Card>
      </li>
    );
  }

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
              <h3 className="m-0 text-balance text-xl font-bold leading-snug text-site-foreground transition-colors group-hover:text-site-primary group-focus-visible:text-site-primary">
                {title}
              </h3>

              <MetaLine
                datetime={datetime}
                formattedDate={formattedDate}
                minutes={minutes}
              />

              <p className="mb-0 mt-2 line-clamp-2 text-[15px] leading-6 text-site-body">
                {description}
              </p>

              {showTags && tags.length > 0 && <TagList tags={tags} />}
            </div>

            {cover ? <ListCover cover={cover} title={title} /> : null}
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
          <div className="flex items-start gap-2.5">
            {icon ? <ArticleIcon icon={icon} size="sm" /> : null}
            <div className="min-w-0 flex-1">
              <h3 className="m-0 text-lg font-bold leading-snug text-site-foreground transition-colors group-hover:text-site-primary group-focus-visible:text-site-primary">
                {title}
              </h3>

              <MetaLine
                datetime={datetime}
                formattedDate={formattedDate}
                minutes={minutes}
              />

              <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-site-body">
                {description}
              </p>

              {showTags && tags.length > 0 && <TagList tags={tags} />}
            </div>

            {cover ? <CardCover cover={cover} title={title} /> : null}
          </div>
        </div>
      </Card>
    </li>
  );
};
