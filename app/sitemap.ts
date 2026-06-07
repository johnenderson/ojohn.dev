import type { MetadataRoute } from 'next';

import {
  getArticlesList,
  parseArticleDate,
} from '@/features/articles/lib/articles';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const articles = getArticlesList().map((article) => ({
    url: `${SITE_URL}/${article.slug}`,
    lastModified: parseArticleDate(article.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/writings`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/now`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/me`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/uses`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...articles,
  ];
}
