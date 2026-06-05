import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageWrapper } from '../../components/PageWrapper';

import {
  getArticleMetadata,
  hasArticleMetadata,
} from '@/features/articles/lib/articles';
import { SITE_URL } from '@/lib/site';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OgPreviewPage({ params }: Readonly<Props>) {
  // This is a development-only debugging page for inspecting OG images.
  // In any non-development environment it should not be reachable.
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const { slug } = await params;

  if (!hasArticleMetadata(slug)) {
    notFound();
  }

  const article = getArticleMetadata(slug);
  const imageUrl = `/og/${slug}`;
  const absoluteImageUrl = `${SITE_URL}${imageUrl}`;

  return (
    <PageWrapper>
      <main id="main">
        <div className="content">
          <div className="flex max-w-5xl flex-col gap-6">
            <div>
              <p className="mb-2 mt-0 text-sm font-semibold uppercase tracking-[0.12em] text-site-primary">
                OG Preview
              </p>
              <h1 className="m-0 text-4xl font-bold text-site-foreground">
                {article.title}
              </h1>
            </div>

            <div className="overflow-hidden rounded-md border border-site-border-muted bg-site-card">
              <Image
                src={imageUrl}
                alt={`Imagem social de ${article.title}`}
                width={1200}
                height={630}
                priority
                className="block h-auto w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link
                href={`/${slug}`}
                className="font-medium text-site-body-muted no-underline transition-colors hover:text-site-primary-hover"
              >
                Abrir artigo
              </Link>
              <a
                href={absoluteImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-site-body-muted no-underline transition-colors hover:text-site-primary-hover"
              >
                Abrir imagem
              </a>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
