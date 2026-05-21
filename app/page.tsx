import type { Metadata } from 'next';

import { AnimationLayout } from 'Base/components/Layout/AnimationLayout';
import { Navbar } from 'Base/components/Navbar';
import { Title } from 'Base/components/Title';
import { About } from 'Home/components/About';
import { SkipLink } from 'Home/components/SkipLink';
import { Writings } from 'Home/components/Writings';

export const metadata: Metadata = {
  title: {
    absolute: 'johnenderson.com',
  },
  description: 'Site pessoal — artigos, notas e experimentos.',
  openGraph: {
    images: [{ url: 'https://johnenderson.com/logo.jpeg' }],
  },
};

export default function Page() {
  return (
    <>
      <Navbar />
      <SkipLink />
      <AnimationLayout>
        <main id="main">
          <div className="content">
            <Title text="John Enderson" />
            <About />
            <Writings />
          </div>
        </main>
      </AnimationLayout>
    </>
  );
}
