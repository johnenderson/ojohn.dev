'use client';

import { ReactNode, useEffect } from 'react';

import { PageWrapper } from './components/PageWrapper';
import { Card } from '@/base/components/Card';

const RetryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="20"
    height="20"
    aria-hidden="true"
  >
    <path d="M5.46257 4.43262C7.21556 2.91688 9.5007 2 12 2C17.5228 2 22 6.47715 22 12C22 14.1361 21.3302 16.1158 20.1892 17.7406L17 12H20C20 7.58172 16.4183 4 12 4C9.84982 4 7.89777 4.84827 6.46023 6.22842L5.46257 4.43262ZM18.5374 19.5674C16.7844 21.0831 14.4993 22 12 22C6.47715 22 2 17.5228 2 12C2 9.86386 2.66979 7.88416 3.8108 6.25944L7 12H4C4 16.4183 7.58172 20 12 20C14.1502 20 16.1022 19.1517 17.5398 17.7716L18.5374 19.5674Z" />
  </svg>
);

const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="20"
    height="20"
    aria-hidden="true"
  >
    <path d="M19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20C20 20.5523 19.5523 21 19 21ZM6 19H18V9.15745L12 3.7029L6 9.15745V19Z" />
  </svg>
);

const cardContentClassName =
  'article-card-glass group w-full p-4 text-left focus-visible:outline-none';

const CardContent = ({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) => (
  <div className="article-card-content flex items-start gap-3">
    <span className="mt-1 shrink-0 leading-none text-site-primary">{icon}</span>
    <div className="min-w-0">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-site-body-muted">
        {eyebrow}
      </p>
      <p className="mb-0 mt-2 text-base font-bold leading-snug text-site-foreground transition-colors group-hover:text-site-primary-hover group-focus-visible:text-site-primary-hover">
        {title}
      </p>
      <p className="mb-0 mt-2 line-clamp-2 text-sm leading-6 text-site-body">
        {description}
      </p>
    </div>
  </div>
);

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: Readonly<ErrorProps>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageWrapper>
      <main id="main">
        <div className="content">
          <section className="site-fade-in flex max-w-3xl flex-col gap-8">
            <div className="flex flex-col gap-3">
              <p className="m-0 text-sm font-semibold uppercase tracking-[0.2em] text-site-primary">
                Erro inesperado
              </p>
              <p
                aria-hidden="true"
                className="m-0 text-[5.5rem] font-black leading-none tracking-tighter text-site-foreground sm:text-[9rem]"
              >
                Ops
              </p>
              <h1 className="m-0 mt-2 text-3xl font-bold leading-tight text-site-foreground sm:text-4xl">
                Algo deu errado
              </h1>
              <p className="m-0 max-w-xl text-site-body">
                Ocorreu um erro inesperado ao carregar esta página. Você pode
                tentar novamente ou voltar para o início.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card
                as="button"
                type="button"
                onClick={reset}
                interactive
                className={`${cardContentClassName} cursor-pointer`}
              >
                <CardContent
                  icon={<RetryIcon />}
                  eyebrow="Recarregar"
                  title="Tentar novamente"
                  description="Recarrega esta página e tenta de novo."
                />
              </Card>
              <Card href="/" interactive className={cardContentClassName}>
                <CardContent
                  icon={<HomeIcon />}
                  eyebrow="Página inicial"
                  title="Voltar para a home"
                  description="Comece de novo a partir do início do site."
                />
              </Card>
            </div>
          </section>
        </div>
      </main>
    </PageWrapper>
  );
}
