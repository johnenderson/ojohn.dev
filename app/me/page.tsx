import Image from 'next/image';
import Link from 'next/link';

import { PageWrapper } from '../components/PageWrapper';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBriefcase,
  faCheck,
  faFaceSmile,
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
import { PageTitle } from '@/base/components/PageTitle';
import {
  SECTION_ACTION_CLASS,
  SectionHeader,
} from '@/base/components/SectionHeader';
import { SECTION_FLAGS } from '@/lib/section-flags';
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

type Fact = {
  label: string;
  value: string;
  detail: string;
  href?: string;
};

const facts: Fact[] = [
  { label: 'Aniversário', value: '02 de fevereiro', detail: 'Aquário' },
  { label: 'Pronomes', value: 'ele/dele', detail: 'Pronomes pessoais' },
  {
    label: 'Trampo',
    value: 'Itaú Unibanco',
    detail: 'Engenheiro de Software',
    href: 'https://www.linkedin.com/company/itau/',
  },
  { label: 'Educação', value: 'Uninove', detail: '2020 - 2025' },
];

// Os mesmos temas citados no último parágrafo da atuação profissional.
const studyTopics = [
  'Engenharia de software',
  'Arquitetura',
  'Observabilidade',
  'Confiabilidade',
  'SRE',
];

// A rota /uses só é oferecida quando a seção está ativa em SECTION_FLAGS.
const exploreLinks = [
  ...(SECTION_FLAGS.uses ? [{ href: '/uses', label: 'O que eu uso' }] : []),
  { href: '/now', label: 'O que ando fazendo agora' },
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

const MONO_LABEL =
  'font-mono text-xs uppercase tracking-wider text-site-body-muted';

const CHIP =
  'flex items-center gap-2 rounded-full border border-site-border-muted bg-site-card px-3 py-1.5 text-sm text-site-foreground';

const icon = (definition: IconDefinition) => (
  <FontAwesomeIcon icon={definition} aria-hidden="true" className="size-4" />
);

const FactStrip = () => (
  // O gap de 1px sobre o fundo da borda desenha as divisórias entre as células.
  <dl className="m-0 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-site-border-muted bg-site-border-subtle sm:grid-cols-2 lg:grid-cols-4">
    {facts.map((fact) => (
      <div
        key={fact.label}
        className="flex flex-col gap-1.5 bg-site-background p-5"
      >
        <dt className={MONO_LABEL}>{fact.label}</dt>
        <dd className="m-0 flex flex-col gap-0.5">
          {fact.href ? (
            <Link
              href={fact.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-bold leading-snug text-site-primary transition-colors hover:text-site-primary-hover"
            >
              {fact.value}
            </Link>
          ) : (
            <span className="text-lg font-bold leading-snug text-site-primary">
              {fact.value}
            </span>
          )}
          <span className="text-sm text-site-body-muted">{fact.detail}</span>
        </dd>
      </div>
    ))}
  </dl>
);

const PreferenceList = ({
  title,
  marker,
  markerClassName,
  items,
}: {
  title: string;
  marker: IconDefinition;
  markerClassName: string;
  items: string[];
}) => (
  <div className="flex flex-col gap-3">
    <h3 className={`m-0 font-normal ${MONO_LABEL}`}>{title}</h3>
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {items.map((item) => (
        <li key={item} className={CHIP}>
          <FontAwesomeIcon
            icon={marker}
            aria-hidden="true"
            className={`size-3 shrink-0 ${markerClassName}`}
          />
          {item}
        </li>
      ))}
    </ul>
  </div>
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
  return (
    <PageWrapper>
      <main id="main">
        <div className="content">
          <div className="flex max-w-5xl flex-col items-start gap-14">
            <div className="grid w-full gap-8 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-12">
              <div>
                <PageTitle
                  title="Sobre mim"
                  subtitle="Um pouco sobre trabalho, vida e o que existe entre uma coisa e outra."
                />

                <section aria-labelledby="intro-title">
                  <SectionHeader
                    icon={icon(faUser)}
                    id="intro-title"
                    title="Oi, eu sou o John!"
                  />
                  <Prose>
                    <p className="m-0">
                      Meu nome é{' '}
                      <strong className="font-semibold text-site-foreground">
                        John Enderson
                      </strong>
                      . Sou uma pessoa de pele clara, mineira que mora em São
                      Paulo e que trava uma pequena batalha diária com a
                      balança.
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
                </section>
              </div>

              <figure className="m-0 w-full max-w-[18rem] self-center justify-self-center md:mt-10">
                <div
                  className={`relative aspect-[3/4] overflow-hidden rounded-md border border-site-border-muted ${CARD_HOVER_LARGE} ${hoverRotation(
                    PHOTO_HOVER_SEED,
                  )}`}
                >
                  <Image
                    src="/me/john_3d.jpg"
                    alt="John Enderson de óculos escuros, em foto com efeito de deslocamento de cores"
                    fill
                    sizes="18rem"
                    loading="eager"
                    fetchPriority="high"
                    className="object-cover"
                  />
                  <span aria-hidden="true" className={CARD_INNER_RING} />
                </div>
              </figure>
            </div>

            <section aria-labelledby="tldr-title" className="w-full">
              <SectionHeader
                icon={icon(faIdCard)}
                id="tldr-title"
                title="Em poucas palavras"
              />
              <FactStrip />
            </section>

            <section aria-labelledby="work-title" className="w-full">
              <SectionHeader
                icon={icon(faBriefcase)}
                id="work-title"
                title="Minha atuação profissional"
              />

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
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

                <aside
                  aria-labelledby="topics-title"
                  className="flex flex-col gap-3 self-start lg:border-l lg:border-site-border-muted lg:pl-6"
                >
                  <h3
                    id="topics-title"
                    className={`m-0 font-normal ${MONO_LABEL}`}
                  >
                    Temas de estudo
                  </h3>
                  <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                    {studyTopics.map((topic) => (
                      <li key={topic} className={CHIP}>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>
            </section>

            <section aria-labelledby="preferences-title" className="w-full">
              <SectionHeader
                icon={icon(faFaceSmile)}
                id="preferences-title"
                title="Curto e não curto"
              />
              <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-12">
                <PreferenceList
                  title="Curto"
                  marker={faCheck}
                  markerClassName="text-site-primary"
                  items={likes}
                />
                <PreferenceList
                  title="Não curto"
                  marker={faXmark}
                  markerClassName="text-site-body-muted"
                  items={dislikes}
                />
              </div>
            </section>

            <section
              aria-labelledby="site-title"
              className="w-full rounded-md border border-site-border-muted bg-site-card p-5 sm:p-8"
            >
              <SectionHeader
                icon={icon(faPenNib)}
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

              <ul className="m-0 mt-6 flex list-none flex-wrap gap-x-6 p-0">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={SECTION_ACTION_CLASS}>
                      {link.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
