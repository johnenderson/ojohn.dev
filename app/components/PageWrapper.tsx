'use client';

import { ReactNode } from 'react';

import { AnimationLayout } from '@/base/components/Layout/AnimationLayout';
import { Navbar } from '@/base/components/Navbar';

type PageWrapperProps = {
  children: ReactNode;
};

// AnimationLayout here handles the enter transition on every client-side navigation.
// There is a separate AnimationLayout in Layout (Providers) that wraps the entire
// page shell — see its comment for why both must coexist.
export function PageWrapper({ children }: Readonly<PageWrapperProps>) {
  return (
    <>
      <Navbar />
      <AnimationLayout>{children}</AnimationLayout>
    </>
  );
}
