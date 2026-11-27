import Link from 'next/link';

import { PageWrapper } from '../components/PageWrapper';
import type { Metadata } from 'next';

import { PageTitle } from '@/base/components/PageTitle';
import { SECTION_ACTION_CLASS } from '@/base/components/SectionHeader';
import { ArticlesList } from '@/features/articles/components/ArticlesList';
import { getArticlesList } from '@/features/articles/lib/articles';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const BLOG_TITLE = 'Blog';
const BLOG_DESCRIPTION = 'Guias, notas e textos pessoais por John Enderson';
const BLOG_URL = `${SITE_URL}/blog`;
const BLOG_OG_IMAGE = `${SITE_URL}/og/site/blog`;

export const metadata: Metadata = {
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: BLOG_URL,
  },
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    images: [{ url: BLOG_OG_IMAGE, width: 1200, height: 630 }],
    siteName: SITE_NAME,
    type: 'website',
    url: BLOG_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    images: [BLOG_OG_IMAGE],
  },
};

const MIN_ARTICLES_PER_TAG = 2;

const formatArticleCount = (count: number) =>
  count === 1 ? '1 artigo' : `${count} artigos`;

/** Quantidade de artigos exibidos e o atalho para assinar o feed. */
const ListSummary = ({ activeTag }: { activeTag?: string }) => {
  const count = getArticlesList().filter(
    (article) => !activeTag || article.tags.includes(activeTag),
  ).length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-site-border-muted pb-2">
      <p className="m-0 text-sm font-medium text-site-body-muted">
        {formatArticleCount(count)}
        {activeTag ? ` com a tag "${activeTag}"` : ''}
      </p>
      <a href="/rss.xml" className={SECTION_ACTION_CLASS}>
        Assinar via RSS →
      </a>
    </div>
  );
};

const getAllTags = () => {
  const counts = new Map<string, number>();
  for (const article of getArticlesList()) {
    for (const tag of article.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
};

const tagChipClassName = (active: boolean) =>
  [
    'rounded border px-2 py-0.5 text-xs font-medium leading-5 no-underline transition-colors',
    active
      ? 'border-site-primary bg-site-primary-soft text-site-primary'
      : 'border-site-border-subtle text-site-body-muted hover:border-site-border hover:text-site-foreground',
  ].join(' ');

const TagFilter = ({ activeTag }: { activeTag?: string }) => {
  // Uma tag usada por um único artigo só leva a uma lista de um item, então
  // vira ruído. O filtro só aparece quando alguma tag agrupa 2+ artigos; a tag
  // ativa (vinda da URL) sempre fica visível para dar uma saída ("todas").
  const tags = getAllTags().filter(
    ([tag, count]) => count >= MIN_ARTICLES_PER_TAG || tag === activeTag,
  );
  if (tags.length === 0) return null;

  return (
    <nav
      aria-label="Filtrar artigos por tag"
      className="mb-8 flex flex-wrap items-center gap-2"
    >
      <Link href="/blog" className={tagChipClassName(!activeTag)}>
        todas
      </Link>
      {tags.map(([tag, count]) => (
        <Link
          key={tag}
          href={`/blog?tag=${encodeURIComponent(tag)}`}
          className={tagChipClassName(tag === activeTag)}
        >
          {tag} <span aria-hidden="true">·</span> {count}
        </Link>
      ))}
    </nav>
  );
};

type BlogPageProps = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function Page({ searchParams }: BlogPageProps) {
  const { tag } = await searchParams;

  return (
    <PageWrapper>
      <main id="main">
        <div className="content">
          <PageTitle
            title="Artigos"
            subtitle="Guias, tutoriais e notas pessoais."
          />
          <TagFilter activeTag={tag} />
          <ListSummary activeTag={tag} />
          <ArticlesList
            featureFirst
            filterTag={tag}
            grouped
            header={false}
            itemVariant="compact"
          />
        </div>
      </main>
    </PageWrapper>
  );
}
