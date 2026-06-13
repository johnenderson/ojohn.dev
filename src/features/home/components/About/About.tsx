import Link from 'next/link';
import { FC } from 'react';

import { faNewspaper, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Divider } from '@/base/components/Divider';
import { SocialIcons } from '@/base/components/SocialIcons';

export const About: FC = () => (
  <section id="about" className="mt-5 flex flex-col gap-4">
    <div>
      <p className="no-margin-top text-site-foreground">
        Desenvolvedor backend
      </p>
      <p className="no-margin max-w-2xl text-site-body">
        Crio coisas com Java e Spring Boot, subo infraestrutura com Terraform e
        AWS.
        <br />
        Atualmente trabalho no{' '}
        <Link
          href="https://www.linkedin.com/company/itau/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline"
        >
          Itaú Unibanco
        </Link>
        ✌️.
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/blog"
        className="cta-solid inline-flex items-center gap-2 rounded-md bg-site-primary px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85"
      >
        <FontAwesomeIcon
          icon={faNewspaper}
          aria-hidden="true"
          className="text-xs"
        />
        Ler o blog
      </Link>
      <Link
        href="/me"
        className="cta-ghost inline-flex items-center gap-2 rounded-md border border-site-border px-4 py-2 text-sm font-semibold no-underline transition-colors hover:border-site-primary"
      >
        <FontAwesomeIcon icon={faUser} aria-hidden="true" className="text-xs" />
        Sobre mim
      </Link>
    </div>
    <SocialIcons />
    <Divider />
  </section>
);
