import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { PageWrapper } from '../components/PageWrapper';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBriefcase,
  faCakeCandles,
  faCheck,
  faCode,
  faFaceFrown,
  faFaceSmile,
  faGraduationCap,
  faHandshake,
  faIdCard,
  faPenNib,
  faUser,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Metadata } from 'next';

import {
  CARD_HOVER_LARGE,
  CARD_INNER_RING,
  hoverRotation,
} from '@/base/card-animation';
import { Card } from '@/base/components/Card';
import { PageTitle } from '@/base/components/PageTitle';
import { SectionHeader } from '@/base/components/SectionHeader';
import { getGithubUsername } from '@/lib/github';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const ABOUT_TITLE = 'Sobre mim';
const ABOUT_DESCRIPTION = 'Sobre John Enderson';
const ABOUT_URL = `${SITE_URL}/me`;
const ABOUT_OG_IMAGE = `${SITE_URL}/og/site/me`;

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

// Seed fixa: sempre a mesma foto, mesma rotação de hover em toda renderização.
const PHOTO_HOVER_SEED = 2;

const likes = [
  'Pizza',
  'Música eletrônica',
  'Instrumentos musicais',
  'Piano e teclado',
  'Tecnologia',
  'Assuntos sobrenaturais',
  'Conversas aleatórias que duram horas',
];

const dislikes = ['Incoerência', 'Frio', 'Falta de propósito'];

const PreferenceCard = ({
  id,
  title,
  icon,
  marker,
  tone,
  items,
}: {
  id: string;
  title: string;
  icon: IconDefinition;
  marker: IconDefinition;
  tone: 'positive' | 'negative';
  items: string[];
}) => (
  <section aria-labelledby={id} data-preference-tone={tone}>
    <Card className="preference-card border p-5">
      <SectionHeader
        icon={
          <FontAwesomeIcon icon={icon} aria-hidden="true" className="size-4" />
        }
        id={id}
        title={title}
      />
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-site-body">
            <FontAwesomeIcon
              icon={marker}
              aria-hidden="true"
              className="preference-card-marker mt-1 size-3.5 shrink-0"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  </section>
);

const Prose = ({ children }: { children: React.ReactNode }) => (
  <div className="flex max-w-3xl flex-col gap-5 leading-relaxed text-site-body-muted">
    {children}
  </div>
);

const InlineLink = ({ href, children }: { href: string; children: string }) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-site-foreground transition-colors hover:text-site-primary-hover"
  >
    {children}
  </Link>
);

export default function Page() {
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

            <section aria-labelledby="tldr-title" className="w-full">
              <SectionHeader
                icon={
                  <FontAwesomeIcon
                    icon={faIdCard}
                    aria-hidden="true"
                    className="size-4"
                  />
                }
                id="tldr-title"
                title="Em poucas palavras"
              />

              <ul className="m-0 mt-3 grid w-full list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
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

            <section aria-labelledby="intro-title" className="w-full">
              <SectionHeader
                icon={
                  <FontAwesomeIcon
                    icon={faUser}
                    aria-hidden="true"
                    className="size-4"
                  />
                }
                id="intro-title"
                title="Oi, eu sou o John!"
              />

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                <Prose>
                  <p className="m-0">
                    Meu nome é{' '}
                    <strong className="font-semibold text-site-foreground">
                      John Enderson
                    </strong>
                    . Sou uma pessoa de pele clara, mineira que mora em São
                    Paulo e que trava uma pequena batalha diária com a balança.
                  </p>

                  <p className="m-0">
                    Além de programar, adoro ouvir música, sair para festas ou
                    simplesmente estar em qualquer lugar com os meus amigos.
                    Também gosto de passar horas em chamadas no Discord,
                    conhecer pessoas novas e conversar sobre os mais variados
                    assuntos — daqueles importantes até os completamente
                    aleatórios.
                  </p>
                </Prose>

                <figure className="m-0 w-full max-w-[17rem] shrink-0 self-center sm:self-start">
                  <div
                    className={`relative aspect-[3/4] overflow-hidden rounded-md border border-site-border-muted ${CARD_HOVER_LARGE} ${hoverRotation(
                      PHOTO_HOVER_SEED,
                    )}`}
                  >
                    <Image
                      src="/me/john_3d.jpg"
                      alt="John Enderson de óculos escuros, em foto com efeito de deslocamento de cores"
                      fill
                      sizes="(min-width: 640px) 17rem, 100vw"
                      className="object-cover"
                    />
                    <span aria-hidden="true" className={CARD_INNER_RING} />
                  </div>
                </figure>
              </div>
            </section>

            <div className="h-px w-full bg-site-border-muted" />

            <section aria-labelledby="site-title" className="w-full">
              <SectionHeader
                icon={
                  <FontAwesomeIcon
                    icon={faPenNib}
                    aria-hidden="true"
                    className="size-4"
                  />
                }
                id="site-title"
                title="Sobre este site"
              />

              <Prose>
                <p className="m-0">
                  A ideia de criar este espaço surgiu a partir da inspiração de{' '}
                  <strong className="font-semibold text-site-foreground">
                    Doce Fernandes
                  </strong>
                  , do <InlineLink href="https://doce.sh">doce.sh</InlineLink>.
                  Ele já me inspirou em diferentes momentos, especialmente
                  quando fazia transmissões na Twitch sobre programação,
                  resolução de desafios no LeetCode e outros assuntos
                  relacionados à tecnologia.
                </p>

                <p className="m-0">
                  Este site também nasceu como uma forma de me incentivar a
                  escrever mais — tanto sobre mim quanto sobre as coisas que
                  venho aprendendo ao longo da minha trajetória.
                </p>

                <p className="m-0">
                  Quero compartilhar conteúdos que possam ser úteis para pessoas
                  que estão procurando ideias para programar, construir um
                  portfólio, desenvolver projetos ou conhecer melhor
                  determinados assuntos relacionados à tecnologia.
                </p>

                <p className="m-0">
                  Não tenho a pretensão de saber tudo. A ideia é documentar
                  aprendizados, experiências, erros e descobertas que talvez
                  também possam ajudar outras pessoas.
                </p>
              </Prose>
            </section>

            <div className="h-px w-full bg-site-border-muted" />

            <section aria-labelledby="work-title" className="w-full">
              <SectionHeader
                icon={
                  <FontAwesomeIcon
                    icon={faBriefcase}
                    aria-hidden="true"
                    className="size-4"
                  />
                }
                id="work-title"
                title="Minha atuação profissional"
              />

              <Prose>
                <p className="m-0">
                  Atualmente, sou{' '}
                  <strong className="font-semibold text-site-foreground">
                    Engenheiro de Software no{' '}
                    <InlineLink href="https://www.linkedin.com/company/itau/">
                      Itaú Unibanco
                    </InlineLink>
                  </strong>
                  , atuando na comunidade de{' '}
                  <strong className="font-semibold text-site-foreground">
                    Gerir Finanças
                  </strong>
                  , responsável por soluções voltadas para clientes pessoa
                  jurídica.
                </p>

                <p className="m-0">
                  Meu principal papel dentro da squad é contribuir para a
                  confiabilidade de jornadas críticas que transacionam bilhões
                  e, em alguns cenários, trilhões de reais mensalmente.
                </p>

                <p className="m-0">
                  Grande parte do meu trabalho está relacionada à criação e
                  evolução de soluções seguras, resilientes e aderentes às
                  diretrizes, aos mandates e aos requisitos de compliance do
                  banco.
                </p>

                <p className="m-0">
                  Também tenho direcionado meus estudos e minha atuação para
                  temas como engenharia de software, arquitetura,
                  observabilidade, confiabilidade e práticas de{' '}
                  <InlineLink href="https://sre.google/">SRE</InlineLink>.
                </p>
              </Prose>
            </section>

            <div className="h-px w-full bg-site-border-muted" />

            <div className="grid w-full items-start gap-3 md:grid-cols-2">
              <PreferenceCard
                id="likes-title"
                title="Curto"
                icon={faFaceSmile}
                marker={faCheck}
                tone="positive"
                items={likes}
              />
              <PreferenceCard
                id="dislikes-title"
                title="Não curto"
                icon={faFaceFrown}
                marker={faXmark}
                tone="negative"
                items={dislikes}
              />
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
