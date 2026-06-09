import { Feed } from 'feed';

import {
  getArticleMetadata,
  getArticlePaths,
  parseArticleDate,
} from '@/features/articles/lib/articles';
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from '@/lib/site';

const AUTHOR = { name: AUTHOR_NAME, link: SITE_URL };

export async function GET() {
  const feed = new Feed({
    title: SITE_NAME,
    description: 'Artigos sobre ML, carreira e tecnologia.',
    id: SITE_URL,
    link: SITE_URL,
    language: 'pt-BR',
    feedLinks: { rss: `${SITE_URL}/rss.xml` },
    copyright: `© ${new Date().getFullYear()} ${AUTHOR_NAME}`,
    author: AUTHOR,
  });

  const paths = getArticlePaths();

  const articles = paths
    .map(({ params }) => {
      const slug = params.slug.join('/');

      try {
        return { slug, ...getArticleMetadata(slug) };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        parseArticleDate(b!.date).getTime() -
        parseArticleDate(a!.date).getTime(),
    );

  for (const article of articles) {
    if (!article) continue;
    feed.addItem({
      title: article.title,
      id: `${SITE_URL}/blog/${article.slug}`,
      link: `${SITE_URL}/blog/${article.slug}`,
      description: article.description ?? '',
      date: parseArticleDate(article.date),
      author: [AUTHOR],
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
