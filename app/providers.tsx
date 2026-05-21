'use client';

import { ReactNode } from 'react';

import { AnimatePresence } from 'framer-motion';

import { Layout } from 'Base/components/Layout';
import { ThemeProvider } from 'Base/components/Theme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Layout>
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </Layout>
    </ThemeProvider>
  );
}
