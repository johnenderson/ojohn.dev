import { ReactNode } from 'react';

import { PageWrapper } from './components/PageWrapper';
import { Card } from '@/base/components/Card';

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

const BlogIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="20"
    height="20"
    aria-hidden="true"
  >
    <path d="M3 18.5V5C3 3.34315 4.34315 2 6 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22H6.5C4.567 22 3 20.433 3 18.5ZM19 20V17H6.5C5.67157 17 5 17.6716 5 18.5C5 19.3284 5.67157 20 6.5 20H19ZM5 15.3368C5.45463 15.1208 5.9632 15 6.5 15H19V4H6C5.44772 4 5 4.44772 5 5V15.3368Z" />
  </svg>
);

type NotFoundCardProps = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
};

const NotFoundCard = ({
  href,
  eyebrow,
  title,
  description,
  icon,
}: NotFoundCardProps) => (
  <Card
    href={href}
    interactive
    className="article-card-glass group p-4 focus-visible:outline-none"
  >
    <div className="article-card-content flex items-start gap-3">
      <span className="mt-1 shrink-0 leading-none text-site-primary">
        {icon}
      </span>
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
  </Card>
);

export default function NotFound() {
  return (
    <PageWrapper>
      <main id="main">
        <div className="content">
          <section className="site-fade-in flex max-w-3xl flex-col gap-8">
            <div className="flex flex-col gap-3">
              <p className="m-0 text-sm font-semibold uppercase tracking-[0.2em] text-site-primary">
                Erro 404
              </p>
              <p
                aria-hidden="true"
                className="m-0 text-[5.5rem] font-black leading-none tracking-tighter text-site-foreground sm:text-[9rem]"
              >
                404
              </p>
              <h1 className="m-0 mt-2 text-3xl font-bold leading-tight text-site-foreground sm:text-4xl">
                Essa página não existe
              </h1>
              <p className="m-0 max-w-xl text-site-body">
                O caminho que você tentou acessar sumiu, foi movido ou nunca
                existiu. O que te trouxe até aqui? Vamos recomeçar por um destes
                lugares.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <NotFoundCard
                href="/"
                icon={<HomeIcon />}
                eyebrow="Página inicial"
                title="Voltar para a home"
                description="Comece de novo a partir do início do site."
              />
              <NotFoundCard
                href="/blog"
                icon={<BlogIcon />}
                eyebrow="Blog"
                title="Ver os artigos"
                description="Guias, notas e textos pessoais por John Enderson."
              />
            </div>
          </section>
        </div>
      </main>
    </PageWrapper>
  );
}
