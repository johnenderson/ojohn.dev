import type { ReactNode } from 'react';

import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { SectionIcon } from '@/base/components/SectionIcon';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

/** Estilo único dos links de ação das seções ("Ver todos", "@usuario"…). */
export const SECTION_ACTION_CLASS =
  'text-sm font-medium text-site-body-muted no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none';

type SectionHeaderProps = {
  /** Ícone da seção; renderizado dentro do selo teal. */
  icon: ReactNode;
  title: string;
  /** Usado pelo `aria-labelledby` da seção. */
  id?: string;
  subtitle?: ReactNode;
  /** Link/ação alinhada à direita (ex.: "Ver todos"). */
  action?: ReactNode;
  className?: string;
  /** ISO da última sincronização. Quando informado, mostra o selo "Atualizado há X". */
  updatedAt?: string | null;
};

/**
 * Header padrão de seção: selo do ícone à esquerda, título e subtítulo
 * opcional, ação opcional à direita. É o único padrão de seção do site —
 * páginas não devem montar cabeçalhos próprios.
 */
export const SectionHeader = ({
  icon,
  title,
  id,
  subtitle,
  action,
  className = '',
  updatedAt,
}: SectionHeaderProps) => (
  <header
    className={`mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}
  >
    <SectionIcon>{icon}</SectionIcon>

    <div className="min-w-0 flex-1">
      <h2
        id={id}
        className="m-0 text-2xl font-bold tracking-normal text-site-foreground"
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="mb-0 mt-1.5 max-w-2xl text-base leading-snug text-site-body-muted">
          {subtitle}
        </p>
      ) : null}
      {updatedAt ? (
        <p className="m-0 mt-2 inline-flex items-center gap-1.5 rounded-full border border-site-border-subtle px-2.5 py-1 text-xs font-medium text-site-body-muted">
          <FontAwesomeIcon
            icon={faCalendarCheck}
            aria-hidden="true"
            className="text-sm"
          />
          Atualizado{' '}
          <strong className="font-semibold text-site-foreground">
            {formatRelativeTime(updatedAt)}
          </strong>
        </p>
      ) : null}
    </div>

    {action ? <div className="shrink-0">{action}</div> : null}
  </header>
);
