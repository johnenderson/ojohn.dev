import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { PageWrapper } from '../components/PageWrapper';
import {
  faCakeCandles,
  faCode,
  faGraduationCap,
  faHandshake,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Metadata } from 'next';

import { Card } from '@/base/components/Card';
import { PageTitle } from '@/base/components/PageTitle';
import { TagList } from '@/features/about/components';
import { getGithubLanguages, getGithubUsername } from '@/lib/github';
import { getLastfmTopTags } from '@/lib/lastfm';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const ABOUT_TITLE = 'Sobre mim';
const ABOUT_DESCRIPTION = 'Sobre John Enderson';
const ABOUT_URL = `${SITE_URL}/me`;
const ABOUT_OG_IMAGE = `${SITE_URL}/og/site/me`;

export const revalidate = 3600;

export const metadata: Metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  alternates: {
    canonical: ABOUT_URL,
  },
  openGraph: {
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    images: [{ url: ABOUT_OG_IMAGE, width: 1200, height: 630 }],
    siteName: SITE_NAME,
    type: 'profile',
    url: ABOUT_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    images: [ABOUT_OG_IMAGE],
  },
};

const tldrCards = [
  {
    icon: faCakeCandles,
    accent: '#ec4899',
    pretitle: 'Aniversário',
    title: '02 de fevereiro',
    description: 'Aquário',
  },
  {
    icon: faHandshake,
    accent: '#f0a66d',
    pretitle: 'Pronomes',
    title: 'ele/dele',
    description: 'Pronomes pessoais',
  },
  {
    icon: faCode,
    accent: '#5bd3c7',
    pretitle: 'Trampo',
    title: 'Itaú Unibanco',
    description: 'Engenheiro de Software',
    href: 'https://www.linkedin.com/company/itau/',
  },
  {
    icon: faGraduationCap,
    accent: '#10b981',
    pretitle: 'Educação',
    title: 'Uninove',
    description: '2020 - 2025',
  },
];

const musicTagColors = ['#ec4899', '#f0a66d', '#5bd3c7', '#8b5cf6', '#facc15'];

export default async function Page() {
  const [languages, musicTags] = await Promise.all([
    getGithubLanguages().catch(() => []),
    getLastfmTopTags({ period: '12month' }).catch(() => []),
  ]);
  const username = getGithubUsername();

  return (
    <PageWrapper>
      <main id="main">
        <div className="content">
          <div className="flex max-w-5xl flex-col items-start gap-8">
            <div className="flex w-full flex-wrap items-center gap-5">
              <Image
                src={`https://github.com/${username}.png?size=192`}
                alt="Foto de John Enderson"
                width={96}
                height={96}
                unoptimized
                className="size-20 shrink-0 rounded-full border-2 border-site-primary object-cover sm:size-24"
              />
              <div className="min-w-0 flex-1">
                <PageTitle
                  title="Sobre mim"
                  subtitle="Um pouco sobre trabalho, vida e o que existe entre uma coisa e outra."
                />
              </div>
            </div>

            <div className="h-px w-full bg-site-border-muted" />

            <section
              aria-labelledby="tldr-title"
              className="flex w-full flex-col gap-6"
            >
              <h2
                id="tldr-title"
                className="m-0 text-2xl font-bold text-site-foreground"
              >
                Em poucas palavras
              </h2>

              <ul className="m-0 grid w-full list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
                {tldrCards.map((card) => (
                  <Card
                    as="li"
                    key={card.pretitle}
                    interactive
                    className="tldr-card flex min-h-28 gap-4 border p-4"
                    style={{ '--tldr-accent': card.accent } as CSSProperties}
                  >
                    <span className="tldr-card-icon flex size-11 shrink-0 items-center justify-center rounded-md">
                      <FontAwesomeIcon icon={card.icon} className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="tldr-card-label m-0 text-xs font-bold uppercase tracking-[0.12em]">
                        {card.pretitle}
                      </h3>
                      {card.href ? (
                        <Link
                          href={card.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mb-1 mt-1 block truncate text-lg font-bold leading-5 text-site-foreground transition-colors hover:text-site-primary-hover"
                        >
                          {card.title}
                        </Link>
                      ) : (
                        <p className="mb-1 mt-1 truncate text-lg font-bold leading-5 text-site-foreground">
                          {card.title}
                        </p>
                      )}
                      <p className="m-0 text-sm leading-5 text-site-body-muted">
                        {card.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </ul>
            </section>

            <div className="h-px w-full bg-site-border-muted" />

            <section
              aria-labelledby="personally-title"
              className="flex w-full max-w-3xl flex-col gap-6"
            >
              <h2
                id="personally-title"
                className="m-0 text-2xl font-bold text-site-foreground"
              >
                Pessoalmente
              </h2>

              <div className="flex flex-col gap-5 text-site-body-muted leading-relaxed">
                <p className="m-0">Oi, eu sou o John!</p>

                <p className="m-0">
                  Atualmente sou Engenheiro de Software no{' '}
                  <Link
                    href="https://www.linkedin.com/company/itau/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-site-foreground hover:text-site-primary-hover transition-colors"
                  >
                    Itaú Unibanco
                  </Link>
                  , atuando na comunidade de Gerir Finanças para clientes PJ.
                  Meu principal papel dentro da squad é garantir a
                  confiabilidade de jornadas críticas que transacionam bilhões
                  e, em alguns cenários, trilhões de reais mensalmente.
                </p>

                <p className="m-0">
                  Grande parte do meu tempo é dedicada a garantir que nossas
                  soluções estejam aderentes às diretrizes, mandates e
                  requisitos de compliance do banco. Também sou um aspirante a{' '}
                  <Link
                    href="https://sre.google/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-site-foreground hover:text-site-primary-hover transition-colors"
                  >
                    SRE
                  </Link>{' '}
                  (Site Reliability Engineer), papel que desempenho dentro da
                  squad, com foco em observabilidade, resiliência e estabilidade
                  de sistemas distribuídos.
                </p>

                <p className="m-0">
                  Trabalho principalmente com Java e Spring Boot, tecnologias
                  que utilizo para resolver problemas de negócio e dos clientes.
                  Também uso Terraform e AWS para criar e gerenciar
                  infraestrutura. Participar de uma modernização me trouxe
                  muitas experiências boas, visão de negócio e muita
                  responsabilidade.
                </p>

                <p className="m-0">
                  Fora do horário comercial, quando não estou lendo, explorando
                  o{' '}
                  <Link
                    href="https://www.datadoghq.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-site-foreground hover:text-site-primary-hover transition-colors"
                  >
                    Datadog
                  </Link>{' '}
                  ou escrevendo código, provavelmente estou em uma call no
                  Discord com amigos ou em algum lugar do mundo vivendo
                  experiências totalmente distantes da tecnologia.
                </p>

                <p className="m-0">
                  Ah, e eu também sou pai de pet. A Maya é a responsável por me
                  lembrar que existe vida fora da tecnologia. rs
                </p>
              </div>
            </section>

            {languages.length > 0 ? (
              <>
                <div className="h-px w-full bg-site-border-muted" />

                <section
                  aria-labelledby="stacks-title"
                  className="flex w-full max-w-3xl flex-col gap-4"
                >
                  <h2
                    id="stacks-title"
                    className="m-0 text-2xl font-bold text-site-foreground"
                  >
                    Stacks que eu codo
                  </h2>
                  <p className="m-0 text-sm text-site-body-muted">
                    As linguagens que mais aparecem nos meus repositórios
                    públicos.
                  </p>
                  <TagList
                    items={languages.map((language) => ({
                      label: language.name,
                      color: language.color,
                      meta: `${language.percentage}%`,
                    }))}
                  />
                </section>
              </>
            ) : null}

            {musicTags.length > 0 ? (
              <>
                <div className="h-px w-full bg-site-border-muted" />

                <section
                  aria-labelledby="listening-title"
                  className="flex w-full max-w-3xl flex-col gap-4"
                >
                  <h2
                    id="listening-title"
                    className="m-0 text-2xl font-bold text-site-foreground"
                  >
                    O que ando curtindo
                  </h2>
                  <p className="m-0 text-sm text-site-body-muted">
                    Os gêneros e tags que dominam o que tenho ouvido no Last.fm.
                  </p>
                  <TagList
                    variant="neutral"
                    items={musicTags.map((tag, index) => ({
                      label: tag.name,
                      color: musicTagColors[index % musicTagColors.length],
                    }))}
                  />
                </section>
              </>
            ) : null}

            <div className="h-px w-full bg-site-border-muted" />

            <p className="text-site-body-muted text-sm m-0">
              Você também pode ler meus{' '}
              <Link
                href="/blog"
                className="text-site-foreground hover:text-site-primary-hover transition-colors"
              >
                artigos
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
