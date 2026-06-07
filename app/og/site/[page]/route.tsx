import { ImageResponse } from 'next/og';

import { AUTHOR_NAME, SITE_NAME } from '@/lib/site';

const size = {
  width: 1200,
  height: 630,
};

const pages = {
  home: {
    eyebrow: SITE_NAME,
    title: 'John Enderson',
    description: 'O John Backend Developer',
    badge: 'Java • Spring Boot • AWS',
  },
  blog: {
    eyebrow: 'Blog',
    title: 'Artigos',
    description: 'Guias, tutoriais e notas pessoais.',
    badge: SITE_NAME,
  },
  me: {
    eyebrow: 'Sobre mim',
    title: AUTHOR_NAME,
    description: 'Trabalho, vida e o que existe entre uma coisa e outra.',
    badge: SITE_NAME,
  },
  now: {
    eyebrow: 'Agora',
    title: 'Ouvindo',
    description: 'Sou um músico enferrujado, que continua amando a música.',
    badge: 'Last.fm',
  },
  uses: {
    eyebrow: 'Uso',
    title: 'Meu setup',
    description: 'Maquinas, perifericos e ferramentas do meu dia a dia.',
    badge: SITE_NAME,
  },
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ page: string }> },
) {
  const { page } = await params;
  const data = pages[page as keyof typeof pages];

  if (!data) {
    return new Response('Not found', { status: 404 });
  }

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
            'radial-gradient(circle at 18% 8%, rgba(91, 211, 199, 0.28), transparent 30%), radial-gradient(circle at 82% 18%, rgba(240, 166, 109, 0.2), transparent 30%), #09080d',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            color: 'rgba(255, 250, 245, 0.72)',
            fontSize: '28px',
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              background: '#fffaf5',
              color: '#09080d',
              fontSize: '28px',
              fontWeight: 900,
            }}
          >
            &lt;/&gt;
          </div>
          {data.eyebrow}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <h1
            style={{
              margin: 0,
              color: '#fffaf5',
              fontSize: '86px',
              fontWeight: 850,
              lineHeight: 1,
              letterSpacing: '-0.035em',
            }}
          >
            {data.title}
          </h1>
          <p
            style={{
              maxWidth: '900px',
              margin: 0,
              color: 'rgba(255, 250, 245, 0.74)',
              fontSize: '38px',
              fontWeight: 650,
              lineHeight: 1.25,
            }}
          >
            {data.description}
          </p>
        </div>

        <div
          style={{
            width: 'fit-content',
            border: '1px solid rgba(91, 211, 199, 0.45)',
            borderRadius: '999px',
            background: 'rgba(91, 211, 199, 0.12)',
            color: '#5bd3c7',
            fontSize: '24px',
            fontWeight: 800,
            padding: '12px 18px',
          }}
        >
          {data.badge}
        </div>
      </div>
    ),
    size,
  );
}
