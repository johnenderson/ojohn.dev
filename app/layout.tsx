import { Geist, Geist_Mono } from 'next/font/google';

import '../styles/globals.css';
import '../styles/night-owl.min.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import 'katex/dist/katex.min.css';
import type { Metadata } from 'next';

import { Providers } from './providers';

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
  metadataBase: new URL('https://johnenderson.com'),
  title: {
    default: 'johnenderson.com',
    template: '%s | johnenderson.com',
  },
  description: 'Site pessoal — artigos, notas e experimentos.',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://johnenderson.com',
    siteName: 'johnenderson.com',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
