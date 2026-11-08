import Link from 'next/link';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faFire } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { getGithubPulse } from '@/lib/github';

const formatNumber = (value: number) =>
  new Intl.NumberFormat('pt-BR').format(value);

const Metric = ({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex min-w-0 items-baseline gap-2 ${className}`}>
    <dt className="shrink-0 text-xs text-site-body-muted">{label}</dt>
    <dd className="m-0 min-w-0 text-sm font-semibold text-site-foreground">
      {children}
    </dd>
  </div>
);

/**
 * Faixa compacta com os sinais do GitHub. Não é uma seção "de conteúdo":
 * fica abaixo do hero como uma linha de status, sem cabeçalho nem card, para
 * que Projetos e Artigos tenham mais peso na página.
 */
export async function DevPulse() {
  const pulse = await getGithubPulse().catch(() => null);

  if (!pulse) return null;

  const {
    username,
    totalContributions,
    currentStreak,
    longestStreak,
    lastActivity,
  } = pulse;

  return (
    <section
      id="dev-pulse"
      aria-label="Pulso de dev"
      className="mt-6 flex flex-col gap-2 md:mt-8 md:flex-row md:items-center md:gap-6"
    >
      <Link
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-site-foreground no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none md:min-h-0"
      >
        <FontAwesomeIcon
          icon={faGithub}
          aria-hidden="true"
          className="size-4 text-site-primary"
        />
        @{username}
      </Link>

      <dl className="m-0 flex min-w-0 flex-1 flex-wrap items-baseline gap-x-6 gap-y-2">
        <Metric label="Sequência">
          <span className="inline-flex items-center gap-1.5">
            <FontAwesomeIcon
              icon={faFire}
              aria-hidden="true"
              className="text-xs text-site-primary"
            />
            {currentStreak} {currentStreak === 1 ? 'dia' : 'dias'}
            <span className="text-xs font-normal text-site-body-muted">
              (recorde {longestStreak})
            </span>
          </span>
        </Metric>

        <Metric label="Contribuições">
          {formatNumber(totalContributions)}
          <span className="ml-1.5 text-xs font-normal text-site-body-muted">
            no último ano
          </span>
        </Metric>

        {lastActivity ? (
          <Metric label="Último commit" className="w-full md:w-auto md:flex-1">
            <Link
              href={lastActivity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block max-w-full truncate text-site-foreground no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
              title={`${lastActivity.message} · ${lastActivity.repo}`}
            >
              {lastActivity.message}
            </Link>
            <span className="block text-xs font-normal text-site-body-muted">
              {lastActivity.repo} · {formatRelativeTime(lastActivity.at)}
            </span>
          </Metric>
        ) : (
          <Metric label="Último commit">
            <span className="font-normal text-site-body-muted">
              Sem atividade pública recente.
            </span>
          </Metric>
        )}
      </dl>
    </section>
  );
}
