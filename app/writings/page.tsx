import { PageWrapper } from '../components/PageWrapper';
import type { Metadata } from 'next';

import { PageTitle } from '@/base/components/PageTitle';
import { ArticlesList } from '@/features/articles/components/ArticlesList';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const BLOG_TITLE = 'Blog';
const BLOG_DESCRIPTION = 'Guias, notas e textos pessoais por John Enderson';
const BLOG_URL = `${SITE_URL}/writings`;
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

export default function Page() {
  return (
    <PageWrapper>
      <main id="main">
        <div className="content">
          <PageTitle
            title="Artigos"
            subtitle="Guias, tutoriais e notas pessoais."
          />
          <ArticlesList grouped header={false} itemVariant="compact" />
        </div>
      </main>
    </PageWrapper>
  );
}
