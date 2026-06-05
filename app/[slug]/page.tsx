import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

import { Layout } from '@/base/article/Layout';
import { MDXServer } from '@/base/components/MDX/MDXServer';
import {
  getArticleContent,
  getArticleMetadata,
  getArticleNavigation,
  getArticlePaths,
  hasArticleContent,
  hasArticleMetadata,
  parseArticleDate,
} from '@/features/articles/lib/articles';
import { getImageMeta } from '@/lib/image';
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from '@/lib/site';

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
  const articleUrl = `${SITE_URL}/${slug}`;
  const articleImageUrl = `${SITE_URL}/og/${slug}`;
  const publishedTime = parseArticleDate(articleMetadata.date).toISOString();

  return {
    title: articleMetadata.title,
    description: articleMetadata.description,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: articleMetadata.title,
      description: articleMetadata.description,
      authors: [AUTHOR_NAME],
      images: [
        {
          url: articleImageUrl,
          width: 1200,
          height: 630,
          alt: articleMetadata.title,
        },
      ],
      publishedTime,
      siteName: SITE_NAME,
      tags: articleMetadata.tags,
      type: 'article',
      url: articleUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: articleMetadata.title,
      description: articleMetadata.description,
      images: [articleImageUrl],
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
  const navigation = getArticleNavigation(slug);
  const articleUrl = `${SITE_URL}/${slug}`;
  const articleImageUrl = `${SITE_URL}/og/${slug}`;
  const publishedTime = parseArticleDate(articleMetadata.date).toISOString();

  const coverImage = articleMetadata.coverImage
    ? {
        ...articleMetadata.coverImage,
        blurDataURL: (await getImageMeta(articleMetadata.coverImage.src))
          .blurDataURL,
      }
    : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    datePublished: publishedTime,
    description: articleMetadata.description,
    headline: articleMetadata.title,
    image: articleImageUrl,
    inLanguage: 'pt-BR',
    mainEntityOfPage: articleUrl,
    publisher: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    url: articleUrl,
  };

  return (
    <Layout
      title={articleMetadata.title}
      date={articleMetadata.date}
      icon={articleMetadata.icon}
      tags={articleMetadata.tags ?? []}
      alternativeArticle={articleMetadata.alternativeArticle}
      minutes={minutes}
      navigation={navigation}
      coverImage={coverImage}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replaceAll('<', String.raw`<`),
        }}
      />
      <MDXServer source={content} />
    </Layout>
  );
}
