import { Geist, Geist_Mono } from 'next/font/google';

import '../styles/globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import 'katex/dist/katex.min.css';
import type { Metadata, Viewport } from 'next';

import { DevPerformanceMeasurePatch } from './components/DevPerformanceMeasurePatch';
import { Providers } from './providers';
import { SITE_NAME, SITE_URL } from '@/lib/site';

// Prevent FontAwesome from adding its CSS dynamically on the server (causes SSR errors)
config.autoAddCss = false;

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Site pessoal — artigos, notas e experimentos.',
  alternates: {
    types: {
      'application/rss+xml': `${SITE_URL}/rss.xml`,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '64x64' },
    ],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
  },
};

// Aplica o tema salvo ANTES do primeiro paint (parser-blocking), evitando o
// flash de tema escuro para quem usa tema claro. Espelha a resolução do
// ThemeProvider: 'light' | 'dark' | 'system' (via prefers-color-scheme), com
// 'dark' como padrão. O ThemeProvider assume o controle após a hidratação.
const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem('theme');
    var resolved =
      stored === 'light' || stored === 'dark'
        ? stored
        : stored === 'system' &&
          matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
    document.documentElement.classList.add(resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();`;

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fffdf9' },
    { media: '(prefers-color-scheme: dark)', color: '#09080d' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded focus:bg-site-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-site-foreground focus:outline-none focus:ring-2 focus:ring-site-primary"
        >
          Ir para o conteúdo principal
        </a>
        <DevPerformanceMeasurePatch />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
