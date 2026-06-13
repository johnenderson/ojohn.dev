import { ImageResponse } from 'next/og';

import {
  getArticleContent,
  getArticleMetadata,
  hasArticleMetadata,
  parseArticleDate,
} from '@/features/articles/lib/articles';

const size = {
  width: 1200,
  height: 630,
};

const formatDate = (raw: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseArticleDate(raw));

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const slug = (await params).slug.join('/');

  if (!hasArticleMetadata(slug)) {
    return new Response('Not found', { status: 404 });
  }

  let article: ReturnType<typeof getArticleMetadata>;
  let minutes: number;

  try {
    article = getArticleMetadata(slug);
    ({ minutes } = getArticleContent(slug));
  } catch {
    return new Response('Not found', { status: 404 });
  }

  let titleFontSize: string;
  if (article.title.length > 70) titleFontSize = '58px';
  else if (article.title.length > 46) titleFontSize = '68px';
  else titleFontSize = '80px';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          color: '#fffaf5',
          background:
            'radial-gradient(circle at 15% 10%, rgba(91, 211, 199, 0.28), transparent 32%), radial-gradient(circle at 85% 12%, rgba(240, 166, 109, 0.18), transparent 28%), #09080d',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '30px',
          }}
        >
          <h1
            style={{
              maxWidth: '1040px',
              margin: 0,
              color: '#fffaf5',
              fontSize: titleFontSize,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: '-0.025em',
            }}
          >
            {article.title}
          </h1>
          <p
            style={{
              maxWidth: '960px',
              margin: 0,
              color: 'rgba(255, 250, 245, 0.72)',
              fontSize: '32px',
              fontWeight: 600,
              lineHeight: 1.35,
            }}
          >
            {article.description}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'rgba(255, 250, 245, 0.68)',
            fontSize: '24px',
            fontWeight: 700,
          }}
        >
          <div style={{ display: 'flex', gap: '18px' }}>
            <span>{formatDate(article.date)}</span>
            <span>•</span>
            <span>{minutes} min de leitura</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid rgba(240, 166, 109, 0.55)',
              borderRadius: '999px',
              background: 'rgba(240, 166, 109, 0.14)',
              color: '#f0a66d',
              fontSize: '22px',
              fontWeight: 800,
              padding: '10px 22px',
            }}
          >
            Ler artigo →
          </div>
        </div>
      </div>
    ),
    size,
  );
}
