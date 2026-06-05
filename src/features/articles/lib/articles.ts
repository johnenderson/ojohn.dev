import type { ImageProps } from 'next/image';
import { cache } from 'react';

import readingTime from 'reading-time';

import {
  getArticleSlugs,
  getArticleSource,
} from '@/features/articles/lib/article-content';
import { Language } from '@/lib/languages';
import { Locale } from '@/types/Locale';

const DEFAULT_ARTICLE_LOCALE: Locale = Language.PT_BR;

export type ArticleCoverImage = {
  src: string;
  width?: ImageProps['width'];
  height?: ImageProps['height'];
  alt: string;
  authorHref: string;
  authorName: string;
  blurDataURL?: string;
};

export type ArticleAlternative = {
  url: string;
  language: string;
};

export type ArticleMetadata = {
  title: string;
  description: string;
  date: string;
  icon?: string;
  tags?: string[];
  coverImage?: ArticleCoverImage;
  alternativeArticle?: ArticleAlternative;
};

export type ArticleListItem = {
  slug: string;
  title: string;
  date: string;
  description: string;
  icon?: string;
  minutes: number;
  tags: string[];
};

export type ArticleNavigationItem = Pick<
  ArticleListItem,
  'slug' | 'title' | 'description' | 'icon'
>;

export type ArticleNavigation = {
  newer: ArticleNavigationItem | null;
  older: ArticleNavigationItem | null;
};

export function parseArticleDate(raw: string): Date {
  const slashDate = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashDate) {
    const [, day, month, year] = slashDate;
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }

  const dashDate = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dashDate) {
    const [, day, month, year] = dashDate;
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }

  return new Date(raw);
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

function isValidIsoDate(raw: string) {
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const [, year, month, day] = match;
  const date = parseArticleDate(raw);

  return (
    isValidDate(date) &&
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() + 1 === Number(month) &&
    date.getUTCDate() === Number(day)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(
  source: Record<string, unknown>,
  key: string,
  context: string,
  { allowEmpty = false }: { allowEmpty?: boolean } = {},
) {
  const value = source[key];
  if (typeof value !== 'string') {
    throw new Error(
      `Invalid article metadata for ${context}: ${key} must be a string.`,
    );
  }
  if (!allowEmpty && !value.trim()) {
    throw new Error(
      `Invalid article metadata for ${context}: ${key} cannot be empty.`,
    );
  }
  return value;
}

function optionalStringValue(source: Record<string, unknown>, key: string) {
  const value = source[key];
  if (value == null) return undefined;
  if (typeof value !== 'string') {
    throw new Error(`Invalid article metadata: ${key} must be a string.`);
  }
  return value;
}

function optionalImageDimension(
  source: Record<string, unknown>,
  key: string,
): ImageProps['width'] {
  const value = source[key];
  if (value == null) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return value as `${number}`;
  }
  throw new Error(`Invalid article metadata: ${key} must be a number.`);
}

function parseCoverImage(value: unknown, context: string): ArticleCoverImage {
  if (!isRecord(value)) {
    throw new Error(
      `Invalid article metadata for ${context}: coverImage is required.`,
    );
  }

  return {
    src: stringValue(value, 'src', context),
    width: optionalImageDimension(value, 'width'),
    height: optionalImageDimension(value, 'height'),
    alt: stringValue(value, 'alt', context, { allowEmpty: true }),
    authorHref: optionalStringValue(value, 'authorHref') ?? '',
    authorName: optionalStringValue(value, 'authorName') ?? '',
  };
}

function parseAlternativeArticle(
  value: unknown,
  context: string,
): ArticleAlternative | undefined {
  if (value == null) return undefined;
  if (!isRecord(value)) {
    throw new Error(
      `Invalid article metadata for ${context}: alternativeArticle must be an object.`,
    );
  }

  return {
    url: stringValue(value, 'url', context),
    language: stringValue(value, 'language', context),
  };
}

function parseTags(value: unknown, context: string): string[] | undefined {
  if (value == null) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(
      `Invalid article metadata for ${context}: tags must be an array.`,
    );
  }

  return value.map((tag, index) => {
    if (typeof tag !== 'string') {
      throw new Error(
        `Invalid article metadata for ${context}: tags[${index}] must be a string.`,
      );
    }

    return tag;
  });
}

function parseArticleMetadata(
  value: unknown,
  context: string,
): ArticleMetadata {
  if (!isRecord(value)) {
    throw new Error(
      `Invalid article metadata for ${context}: expected an object.`,
    );
  }

  const date = stringValue(value, 'date', context);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(
      `Invalid article metadata for ${context}: date must use YYYY-MM-DD format.`,
    );
  }
  if (!isValidIsoDate(date)) {
    throw new Error(
      `Invalid article metadata for ${context}: date must be a valid calendar date.`,
    );
  }

  const metadata = {
    title: stringValue(value, 'title', context),
    description: stringValue(value, 'description', context),
    date,
    icon: optionalStringValue(value, 'icon'),
    tags: parseTags(value.tags, context),
    coverImage:
      value.coverImage == null
        ? undefined
        : parseCoverImage(value.coverImage, context),
    alternativeArticle: parseAlternativeArticle(
      value.alternativeArticle,
      context,
    ),
  };

  return metadata;
}

function parseInlineArray(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return null;

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return [];

  return inner.split(',').map(parseScalar);
}

function parseScalar(value: string): string {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseValue(value: string) {
  return parseInlineArray(value) ?? parseScalar(value);
}

function parseTagEntry(
  lines: string[],
  index: number,
): { tag: string | null; nextIndex: number } {
  const tagLine = lines[index].slice(4);
  const tagObjectMatch = tagLine.match(/^([A-Za-z][\w-]*):(?:\s+([^\r\n]+))?$/);

  if (!tagObjectMatch) {
    return { tag: parseScalar(tagLine), nextIndex: index };
  }

  const tagObject: Record<string, unknown> = {
    [tagObjectMatch[1]]: parseScalar(tagObjectMatch[2] ?? ''),
  };

  let nextIndex = index;
  while (lines[nextIndex + 1]?.startsWith('    ')) {
    nextIndex += 1;
    const nestedMatch = lines[nextIndex]
      .trim()
      .match(/^([A-Za-z][\w-]*):(?:\s+([^\r\n]+))?$/);
    if (nestedMatch) {
      tagObject[nestedMatch[1]] = parseScalar(nestedMatch[2] ?? '');
    }
  }

  const tag = typeof tagObject.name === 'string' ? tagObject.name : null;
  return { tag, nextIndex };
}

function parseTagsBlock(
  lines: string[],
  startIndex: number,
): { tags: string[]; nextIndex: number } {
  const tags: string[] = [];
  let index = startIndex;

  while (lines[index + 1]?.startsWith('  ')) {
    index += 1;
    if (!lines[index].startsWith('  - ')) continue;

    const { tag, nextIndex } = parseTagEntry(lines, index);
    if (tag !== null) tags.push(tag);
    index = nextIndex;
  }

  return { tags, nextIndex: index };
}

function parseNestedBlock(
  lines: string[],
  startIndex: number,
  context: string,
): { nested: Record<string, unknown>; nextIndex: number } {
  const nested: Record<string, unknown> = {};
  let index = startIndex;

  while (lines[index + 1]?.startsWith('  ')) {
    index += 1;
    const nestedMatch = lines[index]
      .trim()
      .match(/^([A-Za-z][\w-]*):(?:\s+([^\r\n]+))?$/);

    if (!nestedMatch) {
      throw new Error(
        `Invalid article frontmatter for ${context}: ${lines[index]}`,
      );
    }

    nested[nestedMatch[1]] = parseValue(nestedMatch[2] ?? '');
  }

  return { nested, nextIndex: index };
}

function parseFrontmatter(frontmatter: string, context: string) {
  const metadata: Record<string, unknown> = {};
  const lines = frontmatter.split(/\r?\n/);
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const rootMatch = line.match(/^([A-Za-z][\w-]*):(?:\s+([^\r\n]+))?$/);
    if (!rootMatch) {
      throw new Error(`Invalid article frontmatter for ${context}: ${line}`);
    }

    const [, key, rawValue = ''] = rootMatch;
    if (rawValue) {
      metadata[key] = parseValue(rawValue);
      index += 1;
      continue;
    }

    if (key === 'tags') {
      const { tags, nextIndex } = parseTagsBlock(lines, index);
      metadata[key] = tags;
      index = nextIndex + 1;
      continue;
    }

    const { nested, nextIndex } = parseNestedBlock(lines, index, context);
    metadata[key] = nested;
    index = nextIndex + 1;
  }

  return metadata;
}

const readArticleFile = cache(
  (slug: string, locale: Locale = DEFAULT_ARTICLE_LOCALE) => {
    const source = getArticleSource(slug, locale);
    const context = `${slug}/${locale}`;

    if (!source) {
      throw new Error(`Missing article content for ${context}.`);
    }

    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

    if (!match) {
      throw new Error(`Missing article frontmatter for ${context}.`);
    }

    return {
      content: source.slice(match[0].length),
      metadata: parseArticleMetadata(
        parseFrontmatter(match[1], context),
        context,
      ),
    };
  },
);

export function hasArticleMetadata(
  slug: string,
  locale: Locale = DEFAULT_ARTICLE_LOCALE,
) {
  if (!hasArticleContent(slug, locale)) return false;

  return /^---\r?\n[\s\S]*?\r?\n---/.test(getArticleSource(slug, locale) ?? '');
}

export function getArticleMetadata(
  slug: string,
  locale: Locale = DEFAULT_ARTICLE_LOCALE,
): ArticleMetadata {
  return readArticleFile(slug, locale).metadata;
}

export function hasArticleContent(
  slug: string,
  locale: Locale = DEFAULT_ARTICLE_LOCALE,
) {
  return getArticleSource(slug, locale) != null;
}

export function getArticleContent(
  slug: string,
  locale: Locale = DEFAULT_ARTICLE_LOCALE,
) {
  const { content } = readArticleFile(slug, locale);
  const { minutes } = readingTime(content);

  return {
    content,
    minutes: Math.max(1, Math.round(minutes)),
  };
}

export function getArticlePaths(locale: Locale = DEFAULT_ARTICLE_LOCALE) {
  return getArticleSlugs(locale).map((slug) => ({
    params: {
      slug,
    },
  }));
}

export const getArticlesList = cache(
  (locale: Locale = DEFAULT_ARTICLE_LOCALE): ArticleListItem[] => {
    return getArticleSlugs(locale)
      .filter((slug) => hasArticleMetadata(slug, locale))
      .map((slug) => {
        const { content, metadata } = readArticleFile(slug, locale);
        const { minutes } = readingTime(content);

        return {
          slug,
          title: metadata.title,
          date: metadata.date,
          description: metadata.description,
          icon: metadata.icon,
          minutes: Math.max(1, Math.round(minutes)),
          tags: metadata.tags ?? [],
        };
      })
      .sort(
        (a, b) =>
          parseArticleDate(b.date).getTime() -
          parseArticleDate(a.date).getTime(),
      );
  },
);

const toNavigationItem = (
  article: ArticleListItem | undefined,
): ArticleNavigationItem | null =>
  article
    ? {
        slug: article.slug,
        title: article.title,
        description: article.description,
        icon: article.icon,
      }
    : null;

export function getArticleNavigation(
  slug: string,
  locale: Locale = DEFAULT_ARTICLE_LOCALE,
): ArticleNavigation {
  const articles = getArticlesList(locale);
  const currentIndex = articles.findIndex((article) => article.slug === slug);

  if (currentIndex === -1) {
    return {
      newer: null,
      older: null,
    };
  }

  return {
    newer: toNavigationItem(articles[currentIndex - 1]),
    older: toNavigationItem(articles[currentIndex + 1]),
  };
}
