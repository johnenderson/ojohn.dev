import type { Metadata } from 'next';

import { AnimationLayout } from '@/base/components/Layout/AnimationLayout';
import { Navbar } from '@/base/components/Navbar';
import { ArticlesList } from '@/features/articles/components/ArticlesList';
import { About } from '@/features/home/components/About';
import { LastfmCard } from '@/features/home/components/Activity';
import { DevPulse } from '@/features/home/components/DevPulse';
import { Hero } from '@/features/home/components/Hero';
import { ProjectsShowcase } from '@/features/home/components/Projects';
import { SkipLink } from '@/features/home/components/SkipLink';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const HOME_TITLE = 'John Enderson - O John Backend Developer';
const HOME_DESCRIPTION = 'Site pessoal — artigos, notas e experimentos.';
const HOME_OG_IMAGE = `${SITE_URL}/og/site/home`;

export const metadata: Metadata = {
  title: {
    absolute: HOME_TITLE,
  },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [{ url: HOME_OG_IMAGE, width: 1200, height: 630 }],
    siteName: SITE_NAME,
    type: 'website',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [HOME_OG_IMAGE],
  },
};

export default function Page() {
  return (
    <>
      <Navbar />
      <SkipLink />
      <AnimationLayout>
        <main id="main">
          <div className="content">
            <Hero />
            <About />
            <DevPulse />
            <ProjectsShowcase />
            <LastfmCard />
            <ArticlesList />
          </div>
        </main>
      </AnimationLayout>
    </>
  );
}
