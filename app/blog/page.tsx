import Link from 'next/link';

import { PageWrapper } from '../components/PageWrapper';
import type { Metadata } from 'next';

import { PageTitle } from '@/base/components/PageTitle';
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
  const tags = getAllTags();
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
          <ArticlesList
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
