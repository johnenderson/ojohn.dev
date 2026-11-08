import Link from 'next/link';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faFire } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { getGithubPulse } from '@/lib/github';

const formatNumber = (value: number) =>
  new Intl.NumberFormat('pt-BR').format(value);

const CELL_CLASS = 'flex min-w-0 flex-col gap-1 bg-site-card px-4 py-3';
const LABEL_CLASS = 'm-0 text-xs text-site-body-muted';
const VALUE_CLASS =
  'm-0 flex min-w-0 items-baseline gap-1.5 text-base font-bold leading-tight text-site-foreground';

/**
 * Barra de status do GitHub, logo abaixo do hero. Um único bloco com células
 * separadas por filetes de 1px (o `gap-px` sobre o fundo da borda): rótulo
 * pequeno em cima, valor em destaque embaixo. Sem cabeçalho de seção, para
 * pesar menos que Projetos e Artigos.
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
    <section id="dev-pulse" aria-label="Pulso de dev" className="mt-8 md:mt-10">
      <dl className="m-0 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-site-border-muted bg-site-border-subtle md:grid-cols-[auto_auto_auto_minmax(0,1fr)]">
        <div className={`${CELL_CLASS} col-span-2 md:col-span-1`}>
          <dt className={LABEL_CLASS}>GitHub</dt>
          <dd className={VALUE_CLASS}>
            <Link
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-site-foreground no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
            >
              <FontAwesomeIcon
                icon={faGithub}
                aria-hidden="true"
                className="size-4 text-site-primary"
              />
              @{username}
            </Link>
          </dd>
        </div>

        <div className={CELL_CLASS}>
          <dt className={LABEL_CLASS}>Sequência</dt>
          <dd className={VALUE_CLASS}>
            <FontAwesomeIcon
              icon={faFire}
              aria-hidden="true"
              className="self-center text-sm text-site-primary"
            />
            {currentStreak} {currentStreak === 1 ? 'dia' : 'dias'}
            <span className="text-xs font-normal text-site-body-muted">
              recorde {longestStreak}
            </span>
          </dd>
        </div>

        <div className={CELL_CLASS}>
          <dt className={LABEL_CLASS}>Contribuições no último ano</dt>
          <dd className={VALUE_CLASS}>{formatNumber(totalContributions)}</dd>
        </div>

        <div className={`${CELL_CLASS} col-span-2 md:col-span-1`}>
          <dt className={LABEL_CLASS}>Último commit</dt>
          {lastActivity ? (
            <dd className="m-0 flex min-w-0 flex-col gap-0.5">
              <Link
                href={lastActivity.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block max-w-full truncate text-base font-bold leading-tight text-site-foreground no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
                title={`${lastActivity.message} · ${lastActivity.repo}`}
              >
                {lastActivity.message}
              </Link>
              <span className="truncate text-xs text-site-body-muted">
                {lastActivity.repo} · {formatRelativeTime(lastActivity.at)}
              </span>
            </dd>
          ) : (
            <dd className="m-0 text-sm text-site-body-muted">
              Sem atividade pública recente.
            </dd>
          )}
        </div>
      </dl>
    </section>
  );
}
