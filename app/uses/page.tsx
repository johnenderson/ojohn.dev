import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

import { PageWrapper } from '../components/PageWrapper';
import type { Metadata } from 'next';

import { PageTitle } from '@/base/components/PageTitle';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const USES_TITLE = 'Uso';
const USES_DESCRIPTION =
  'Meu setup atual de trabalho, jogos, periféricos e ferramentas.';
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

type Product = {
  label?: string;
  product: string;
  detail?: string;
};

type App = {
  name: string;
  label: string;
  iconSrc: string;
};

const workPc: Product[] = [
  {
    label: 'Notebook',
    product: 'Lenovo ThinkPad E14 Gen 6',
  },
  {
    label: 'Sistema',
    product: 'Red Hat Enterprise Linux 9',
    detail: 'RHEL 9',
  },
];

const desktop: Product[] = [
  {
    label: 'CPU',
    product: 'AMD Ryzen 7 5700X',
    detail: '8 cores',
  },
  {
    label: 'GPU',
    product: 'INNO3D GeForce RTX 3050 Twin X2 OC',
    detail: '8 GB GDDR6',
  },
  {
    label: 'RAM',
    product: '16 GB DDR4',
  },
  {
    label: 'Sistema',
    product: 'Windows 11 Pro',
  },
  {
    label: 'Placa-mãe',
    product: 'MSI MPG B550 Gaming Plus',
    detail: 'B550, AM4, ATX, DDR4',
  },
  {
    label: 'Fonte',
    product: 'Cooler Master G600',
    detail: '600W, 80 Plus Gold',
  },
  {
    label: 'Cooler',
    product: 'Cooler Master MasterLiquid ML240L V2',
    detail: 'water cooler 240mm',
  },
  {
    label: 'Armazenamento',
    product: 'Asgard AN4 NVMe SSD',
    detail: 'PCIe 4.0, M.2 2280',
  },
  {
    label: 'Gabinete',
    product: 'Montech Sky Two',
    detail: 'ARGB, Mid Tower, vidro temperado',
  },
];

const desk: Product[] = [
  {
    label: 'Monitor',
    product: 'AOC Viper 27"',
    detail: 'Full HD, 165 Hz, 1 ms, IPS, FreeSync',
  },
  {
    label: 'Teclado',
    product: 'Logitech G PRO TKL',
    detail: 'layout US, RGB LIGHTSYNC, GX Blue Clicky',
  },
  {
    label: 'Mouse',
    product: 'Logitech G403 HERO',
    detail: 'LIGHTSYNC, 6 botoes, sensor HERO 25K',
  },
];

const audio: Product[] = [
  {
    label: 'Headset',
    product: 'Logitech G733',
    detail: 'sem fio, 7.1 Dolby Surround, Blue VO!CE',
  },
  {
    label: 'Fone de ouvido',
    product: 'AirPods',
  },
  {
    label: 'Microfone',
    product: 'A definir',
  },
];

const developmentSoftware: App[] = [
  {
    name: 'Visual Studio Code',
    label: 'editor principal',
    iconSrc: '/uses/vscode.webp',
  },
  {
    name: 'IntelliJ IDEA',
    label: 'Java e Kotlin',
    iconSrc: '/uses/intellij.webp',
  },
  {
    name: 'Warp',
    label: 'terminal',
    iconSrc: '/uses/warp.webp',
  },
];

const generalSoftware: App[] = [
  {
    name: 'Spotify',
    label: 'música',
    iconSrc: '/uses/spotify.webp',
  },
  {
    name: 'Bitwarden',
    label: 'senhas',
    iconSrc: '/uses/bitwarden.webp',
  },
  {
    name: 'Obsidian',
    label: 'anotações',
    iconSrc: '/uses/obsidian.webp',
  },
];

const Divider = () => (
  <hr className="m-0 w-full border-0 border-t border-site-border-muted" />
);

const UsesSection = ({
  id,
  title,
  children,
  delay = 0,
}: {
  id: string;
  title: string;
  children: ReactNode;
  delay?: number;
}) => (
  <section
    aria-labelledby={id}
    className="site-fade-in flex w-full flex-col gap-6 md:flex-row md:gap-10"
    style={
      {
        '--fade-in-delay': `${delay}ms`,
        '--fade-in-duration': '500ms',
      } as CSSProperties
    }
  >
    <h2
      id={id}
      className="m-0 flex h-fit w-28 shrink-0 flex-col gap-1 text-xs font-semibold uppercase tracking-widest text-site-body-muted before:mb-1 before:block before:h-px before:w-6 before:bg-site-primary before:content-['']"
    >
      {title}
    </h2>
    {children}
  </section>
);

const ProductsGrid = ({ items }: { items: Product[] }) => (
  <ul className="m-0 grid w-full list-none grid-cols-1 gap-x-12 gap-y-8 p-0 sm:grid-cols-2 lg:grid-cols-3">
    {items.map((item) => (
      <li key={`${item.label}-${item.product}`} className="flex flex-col gap-1">
        {item.label ? (
          <p className="m-0 text-xs font-medium uppercase tracking-wide text-site-body-muted">
            {item.label}
          </p>
        ) : null}
        <p
          className="m-0 font-medium leading-5 text-site-foreground"
          translate="no"
        >
          {item.product}
        </p>
        {item.detail ? (
          <div className="flex flex-wrap gap-1">
            {item.detail.split(', ').map((spec) => (
              <span
                key={spec}
                className="rounded border border-site-border-subtle px-1.5 py-0.5 text-xs text-site-body-muted"
              >
                {spec}
              </span>
            ))}
          </div>
        ) : null}
      </li>
    ))}
  </ul>
);

const AppsGrid = ({ items }: { items: App[] }) => (
  <ul className="m-0 flex list-none flex-wrap gap-5 p-0">
    {items.map((item) => (
      <li
        key={item.name}
        className="flex w-[88px] flex-col items-center gap-2 text-center"
      >
        <div className="rounded-xl border border-site-border-subtle bg-site-card p-2 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
          <Image
            src={item.iconSrc}
            alt={item.name}
            width={64}
            height={64}
            className="size-16 rounded-lg object-cover"
          />
        </div>
        <div className="flex w-full flex-col gap-0.5">
          <p
            className="m-0 line-clamp-2 text-xs font-medium leading-4 text-site-foreground"
            translate="no"
          >
            {item.name}
          </p>
          <p className="m-0 text-xs leading-4 text-site-body-muted">
            {item.label}
          </p>
        </div>
      </li>
    ))}
  </ul>
);

export default function UsesPage() {
  return (
    <PageWrapper>
      <main id="main">
        <div className="content">
          <div className="flex max-w-5xl flex-col items-start gap-3">
            <PageTitle
              title="Uso"
              subtitle="Meu setup atual de trabalho, jogos, periféricos e ferramentas."
            />

            <Divider />

            <UsesSection id="work-pc-title" title="Trabalho" delay={0}>
              <ProductsGrid items={workPc} />
            </UsesSection>

            <Divider />

            <UsesSection id="desktop-title" title="Desktop" delay={80}>
              <ProductsGrid items={desktop} />
            </UsesSection>

            <Divider />

            <UsesSection id="desk-title" title="Mesa" delay={160}>
              <ProductsGrid items={desk} />
            </UsesSection>

            <Divider />

            <UsesSection id="audio-title" title="Áudio" delay={240}>
              <ProductsGrid items={audio} />
            </UsesSection>

            <Divider />

            <UsesSection
              id="development-software-title"
              title="Desenvolvimento"
              delay={320}
            >
              <AppsGrid items={developmentSoftware} />
            </UsesSection>

            <Divider />

            <UsesSection id="general-software-title" title="Geral" delay={400}>
              <AppsGrid items={generalSoftware} />
            </UsesSection>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
