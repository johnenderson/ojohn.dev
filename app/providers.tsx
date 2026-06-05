'use client';

import { ReactNode } from 'react';

import { MotionConfig } from 'motion/react';

import { Layout } from '@/base/components/Layout';
import { ThemeProvider } from '@/base/components/Theme';

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <Layout>{children}</Layout>
      </MotionConfig>
    </ThemeProvider>
  );
}
