import { notFound } from 'next/navigation';

import type { Metadata } from 'next';
import { getPlaiceholder } from 'plaiceholder';

import { Layout } from '@/base/article/Layout';
import { MDXServer } from '@/base/components/MDX/MDXServer';
import {
  getArticleContent,
  getArticleMetadata,
  getArticlePaths,
  hasArticleContent,
  hasArticleMetadata,
} from '@/features/articles/lib/articles';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getArticlePaths().map(({ params }) => params);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (!hasArticleMetadata(slug)) {
    return {};
  }

  const articleMetadata = getArticleMetadata(slug);

  return {
    title: articleMetadata.title,
    description: articleMetadata.description,
    openGraph: {
      images: [{ url: articleMetadata.coverImage.src }],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  if (!hasArticleContent(slug) || !hasArticleMetadata(slug)) {
    notFound();
  }

  const { content, minutes } = getArticleContent(slug);
  const articleMetadata = getArticleMetadata(slug);
  const { base64, img } = await getPlaiceholder(articleMetadata.coverImage.src);

  const coverImage = {
    ...articleMetadata.coverImage,
    src: img.src,
    blurDataURL: base64,
  };

  return (
    <Layout
      title={articleMetadata.title}
      date={articleMetadata.date}
      icon={articleMetadata.icon}
      tags={articleMetadata.tags ?? []}
      alternativeArticle={articleMetadata.alternativeArticle}
      minutes={minutes}
      coverImage={coverImage}
    >
      <MDXServer source={content} />
    </Layout>
  );
}
