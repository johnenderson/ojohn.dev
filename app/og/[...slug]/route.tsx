import { ImageResponse } from 'next/og';

import path from 'node:path';
import sharp from 'sharp';

import {
  getArticleContent,
  getArticleMetadata,
  hasArticleMetadata,
  parseArticleDate,
} from '@/features/articles/lib/articles';
import { AUTHOR_NAME, SITE_NAME } from '@/lib/site';

const size = {
  width: 1200,
  height: 630,
};

/**
 * O Satori (`next/og`) não decodifica WebP nem resolve caminhos relativos, então
 * lemos o ícone de `/public` e o rasterizamos para um PNG (2x) embutido como data
 * URI. Retorna `null` para ícones que não são imagem (emoji) ou em caso de falha.
 */
const getIconDataUri = async (icon: string): Promise<string | null> => {
  if (!icon.startsWith('/')) return null;

  try {
    const iconPath = path.join(process.cwd(), 'public', icon);
    const png = await sharp(iconPath)
      .resize(152, 152, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
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
  if (article.title.length > 72) titleFontSize = '54px';
  else if (article.title.length > 48) titleFontSize = '62px';
  else titleFontSize = '72px';

  const iconDataUri = article.icon ? await getIconDataUri(article.icon) : null;
  const iconText =
    article.icon && !article.icon.startsWith('/') ? article.icon : '✦';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          color: '#fffaf5',
          background:
            'radial-gradient(circle at 15% 10%, rgba(91, 211, 199, 0.28), transparent 32%), radial-gradient(circle at 85% 12%, rgba(240, 166, 109, 0.18), transparent 28%), #09080d',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              width: '76px',
              height: '76px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(91, 211, 199, 0.55)',
              borderRadius: '999px',
              background: 'rgba(91, 211, 199, 0.14)',
              color: '#5bd3c7',
              fontSize: '40px',
              lineHeight: 1,
            }}
          >
            {iconDataUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconDataUri}
                alt=""
                width={48}
                height={48}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              iconText
            )}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              style={{
                color: 'rgba(255, 250, 245, 0.72)',
                fontSize: '28px',
                fontWeight: 700,
              }}
            >
              {SITE_NAME}
            </div>
            <div
              style={{
                color: '#5bd3c7',
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {AUTHOR_NAME}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '26px',
          }}
        >
          <h1
            style={{
              maxWidth: '980px',
              margin: 0,
              color: '#fffaf5',
              fontSize: titleFontSize,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            {article.title}
          </h1>
          <p
            style={{
              maxWidth: '940px',
              margin: 0,
              color: 'rgba(255, 250, 245, 0.72)',
              fontSize: '30px',
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
