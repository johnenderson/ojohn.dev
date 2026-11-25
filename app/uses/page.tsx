import { notFound } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';

import { PageWrapper } from '../components/PageWrapper';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faClaude,
  faCloudflare,
  faGitAlt,
  faObsidian,
  faOpenai,
  faReact,
  faSpotify,
  faTailwindCss,
  faTypescript,
  faUbuntu,
} from '@fortawesome/free-brands-svg-icons';
import {
  faBriefcase,
  faCloudArrowUp,
  faCode,
  faDesktop,
  faFileLines,
  faKeyboard,
  faLaptopCode,
  faMagnifyingGlassChart,
  faScrewdriverWrench,
  faShieldHalved,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Metadata } from 'next';

import { Card } from '@/base/components/Card';
import { PageTitle } from '@/base/components/PageTitle';
import { SectionHeader } from '@/base/components/SectionHeader';
import { DeviceArt, type Device } from '@/features/uses/components/DeviceArt';
import { SECTION_FLAGS } from '@/lib/section-flags';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const USES_TITLE = 'Uso';
const USES_DESCRIPTION =
  'As máquinas, os periféricos e as ferramentas que uso para trabalhar e jogar.';
const USES_URL = `${SITE_URL}/uses`;
const USES_OG_IMAGE = `${SITE_URL}/og/site/uses`;

export const metadata: Metadata = {
  title: USES_TITLE,
  description: USES_DESCRIPTION,
  alternates: {
    canonical: USES_URL,
  },
  openGraph: {
    title: USES_TITLE,
    description: USES_DESCRIPTION,
    images: [{ url: USES_OG_IMAGE, width: 1200, height: 630 }],
    siteName: SITE_NAME,
    type: 'website',
    url: USES_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: USES_TITLE,
    description: USES_DESCRIPTION,
    images: [USES_OG_IMAGE],
  },
};

type Spec = {
  label: string;
  product: string;
  detail?: string;
};

type Gear = Spec & {
  device: Device;
  /** Ocupa duas colunas no desktop. */
  wide?: boolean;
};

const highlights: Spec[] = [
  {
    label: 'Processador',
    product: 'Ryzen 7 5700X',
    detail: 'AMD · 8 núcleos · 16 threads',
  },
  {
    label: 'Placa de vídeo',
    product: 'GeForce RTX 3050',
    detail: 'INNO3D Twin X2 OC · 8 GB GDDR6',
  },
  {
    label: 'Memória',
    product: '16 GB DDR4',
    detail: '2 × 8 GB',
  },
];

const parts: Spec[] = [
  {
    label: 'Placa-mãe',
    product: 'MSI MPG B550 Gaming Plus',
    detail: 'AM4 · ATX',
  },
  {
    label: 'Armazenamento',
    product: 'Asgard AN4 1 TB',
    detail: 'NVMe M.2 2280 · PCIe 4.0',
  },
  {
    label: 'Refrigeração',
    product: 'Cooler Master MasterLiquid ML240L V2',
    detail: 'Water cooler de 240 mm',
  },
  {
    label: 'Fonte',
    product: 'Cooler Master G600',
    detail: '600 W · 80 Plus Gold',
  },
  {
    label: 'Gabinete',
    product: 'Montech Sky Two',
    detail: 'Mid tower · vidro temperado · ARGB',
  },
  {
    label: 'Sistema',
    product: 'Windows 11 Pro',
  },
];

const gear: Gear[] = [
  {
    device: 'monitor',
    label: 'Monitor principal',
    product: 'AOC Viper 27"',
    detail: '27G2WG3 · IPS · Full HD · 165 Hz · 1 ms · FreeSync',
    wide: true,
  },
  {
    device: 'monitor',
    label: 'Segundo monitor',
    product: 'AOC 24"',
    detail: '24B1W1G5 · Full HD · até 75 Hz',
    wide: true,
  },
  {
    device: 'mouse',
    label: 'Mouse',
    product: 'Logitech G403 HERO',
    detail: 'Sensor HERO 25K · 6 botões · LIGHTSYNC',
  },
  {
    device: 'keyboard',
    label: 'Teclado',
    product: 'Logitech G PRO TKL',
    detail: 'GX Blue Clicky · layout US · LIGHTSYNC',
  },
  {
    device: 'headset',
    label: 'Headset',
    product: 'Logitech G733',
    detail: 'Sem fio · 7.1 Dolby Surround · Blue VO!CE',
  },
  {
    device: 'earbuds',
    label: 'Fone de ouvido',
    product: 'AirPods',
  },
];

const workPc: Spec[] = [
  {
    label: 'Notebook',
    product: 'Lenovo ThinkPad E14 Gen 6',
  },
  {
    label: 'Sistema',
    product: 'Red Hat Enterprise Linux 9',
  },
];

const toolGroups: {
  title: string;
  tools: { name: string; use: string; icon: IconDefinition }[];
}[] = [
  {
    title: 'Desenvolvimento',
    tools: [
      { name: 'Visual Studio Code', use: 'Editor de código', icon: faCode },
      { name: 'IntelliJ IDEA', use: 'Java e Kotlin', icon: faLaptopCode },
      { name: 'Warp', use: 'Terminal', icon: faTerminal },
      {
        name: 'Claude Code',
        use: 'Assistente de IA para programar',
        icon: faClaude,
      },
      {
        name: 'Codex',
        use: 'Assistente de IA para programar',
        icon: faOpenai,
      },
      {
        name: 'Ubuntu no WSL 2',
        use: 'Linux dentro do Windows',
        icon: faUbuntu,
      },
      {
        name: 'Git e GitHub',
        use: 'Versionamento e pull requests',
        icon: faGitAlt,
      },
    ],
  },
  {
    title: 'Este site',
    tools: [
      { name: 'Next.js e React', use: 'Base do site', icon: faReact },
      { name: 'TypeScript', use: 'Linguagem do projeto', icon: faTypescript },
      { name: 'Tailwind CSS', use: 'Estilos', icon: faTailwindCss },
      { name: 'Vercel', use: 'Hospedagem e deploy', icon: faCloudArrowUp },
      { name: 'Cloudflare', use: 'DNS do domínio', icon: faCloudflare },
      {
        name: 'SonarCloud',
        use: 'Análise de qualidade do código',
        icon: faMagnifyingGlassChart,
      },
      {
        name: 'OpenSpec',
        use: 'Especificação das mudanças',
        icon: faFileLines,
      },
    ],
  },
  {
    title: 'Dia a dia',
    tools: [
      { name: 'Obsidian', use: 'Anotações', icon: faObsidian },
      { name: 'Bitwarden', use: 'Senhas', icon: faShieldHalved },
      { name: 'Spotify', use: 'Música', icon: faSpotify },
    ],
  },
];

const UsesSection = ({
  id,
  title,
  subtitle,
  icon,
  children,
  delay = 0,
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: IconDefinition;
  children: ReactNode;
  delay?: number;
}) => (
  <section
    aria-labelledby={id}
    className="site-fade-in w-full"
    style={
      {
        '--fade-in-delay': `${delay}ms`,
        '--fade-in-duration': '500ms',
      } as CSSProperties
    }
  >
    <SectionHeader
      icon={
        <FontAwesomeIcon icon={icon} aria-hidden="true" className="size-4" />
      }
      id={id}
      title={title}
      subtitle={subtitle}
    />
    {children}
  </section>
);

const SpecLabel = ({ children }: { children: ReactNode }) => (
  <dt className="font-mono text-xs uppercase tracking-wider text-site-body-muted">
    {children}
  </dt>
);

// O gap de 1px sobre o fundo da borda desenha as divisórias entre as células.
const CELL_GRID = 'm-0 grid grid-cols-1 gap-px bg-site-border-subtle';
const CELL = 'bg-site-background p-5';

const SpecSheet = () => (
  <div className="flex flex-col gap-px overflow-hidden rounded-md border border-site-border-muted bg-site-border-subtle">
    <dl className={`${CELL_GRID} md:grid-cols-3`}>
      {highlights.map((spec) => (
        <div key={spec.label} className={`${CELL} flex flex-col gap-2`}>
          <SpecLabel>{spec.label}</SpecLabel>
          <dd className="m-0 flex flex-col gap-1">
            <span
              className="text-2xl font-bold leading-tight text-site-primary"
              translate="no"
            >
              {spec.product}
            </span>
            <span className="text-sm text-site-body-muted">{spec.detail}</span>
          </dd>
        </div>
      ))}
    </dl>
    <dl className={`${CELL_GRID} sm:grid-cols-2`}>
      {parts.map((spec) => (
        <div key={spec.label} className={`${CELL} flex flex-col gap-1.5`}>
          <SpecLabel>{spec.label}</SpecLabel>
          <dd className="m-0 flex flex-col gap-0.5">
            <span
              className="font-medium leading-snug text-site-foreground"
              translate="no"
            >
              {spec.product}
            </span>
            {spec.detail ? (
              <span className="text-sm text-site-body-muted">
                {spec.detail}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  </div>
);

const GearGrid = () => (
  <ul className="m-0 grid w-full list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
    {gear.map((item) => (
      <Card
        as="li"
        key={item.label}
        className={`flex flex-col ${item.wide ? 'lg:col-span-2' : ''}`}
      >
        <div className="flex h-40 items-center justify-center border-b border-site-border-subtle bg-[radial-gradient(var(--site-border-muted)_1px,transparent_1px)] bg-[length:14px_14px] text-site-foreground">
          <DeviceArt device={item.device} className="h-28 w-44" />
        </div>
        <div className="flex flex-col gap-1 p-4">
          <p className="m-0 font-mono text-xs uppercase tracking-wider text-site-body-muted">
            {item.label}
          </p>
          <p
            className="m-0 font-semibold leading-snug text-site-foreground"
            translate="no"
          >
            {item.product}
          </p>
          {item.detail ? (
            <p className="m-0 text-sm leading-snug text-site-body-muted">
              {item.detail}
            </p>
          ) : null}
        </div>
      </Card>
    ))}
  </ul>
);

const WorkSetup = () => (
  <dl
    className={`${CELL_GRID} overflow-hidden rounded-md border border-site-border-muted sm:grid-cols-2`}
  >
    {workPc.map((spec) => (
      <div key={spec.label} className={`${CELL} flex flex-col gap-1.5`}>
        <SpecLabel>{spec.label}</SpecLabel>
        <dd className="m-0 font-medium text-site-foreground" translate="no">
          {spec.product}
        </dd>
      </div>
    ))}
  </dl>
);

const Toolbox = () => (
  <div
    className={`${CELL_GRID} overflow-hidden rounded-md border border-site-border-muted md:grid-cols-3`}
  >
    {toolGroups.map((group) => (
      <div key={group.title} className={`${CELL} flex flex-col gap-4`}>
        <h3 className="m-0 font-mono text-xs font-normal uppercase tracking-wider text-site-primary">
          {group.title}
        </h3>
        <dl className="m-0 flex flex-col gap-3">
          {group.tools.map((tool) => (
            <div key={tool.name} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-site-border-muted bg-site-card text-site-foreground"
              >
                <FontAwesomeIcon icon={tool.icon} className="size-4" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <dt
                  className="font-medium leading-snug text-site-foreground"
                  translate="no"
                >
                  {tool.name}
                </dt>
                <dd className="m-0 text-sm leading-snug text-site-body-muted">
                  {tool.use}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    ))}
  </div>
);

export default function UsesPage() {
  if (!SECTION_FLAGS.uses) notFound();

  return (
    <PageWrapper>
      <main id="main">
        <div className="content">
          <div className="flex max-w-5xl flex-col items-start gap-14">
            <div className="-mb-14">
              <PageTitle title="Uso" subtitle={USES_DESCRIPTION} />
            </div>

            <UsesSection
              id="desktop-title"
              title="Desktop gamer"
              subtitle="Onde os jogos rodam."
              icon={faDesktop}
            >
              <SpecSheet />
            </UsesSection>

            <UsesSection
              id="desk-title"
              title="Mesa e áudio"
              subtitle="O que fica ao alcance das mãos e dos ouvidos."
              icon={faKeyboard}
              delay={80}
            >
              <GearGrid />
            </UsesSection>

            <UsesSection
              id="work-title"
              title="Trabalho"
              subtitle="A máquina do expediente."
              icon={faBriefcase}
              delay={160}
            >
              <WorkSetup />
            </UsesSection>

            <UsesSection
              id="tools-title"
              title="Ferramentas"
              subtitle="Os programas e serviços que me acompanham."
              icon={faScrewdriverWrench}
              delay={240}
            >
              <Toolbox />
            </UsesSection>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
