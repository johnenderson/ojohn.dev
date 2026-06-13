import Link from 'next/link';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faFire } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Card } from '@/base/components/Card';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { getGithubPulse } from '@/lib/github';

const formatNumber = (value: number) =>
  new Intl.NumberFormat('pt-BR').format(value);

const Stat = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex min-w-0 flex-col gap-1">
    <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-site-body-muted">
      {label}
    </p>
    {children}
  </div>
);

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
    <section id="dev-pulse" className="mt-6 md:mt-8">
      <Card interactive className="flex flex-col gap-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="m-0 text-base font-semibold text-site-foreground">
              Pulso de dev
            </h2>
            <FontAwesomeIcon
              icon={faGithub}
              aria-hidden="true"
              className="text-site-body-muted"
            />
          </div>
          <Link
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-site-body-muted no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
          >
            @{username}
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Stat label="Sequência">
            <p className="m-0 inline-flex items-center gap-1.5 text-2xl font-bold leading-none text-site-foreground">
              <FontAwesomeIcon
                icon={faFire}
                aria-hidden="true"
                className="text-lg text-site-primary"
              />
              {currentStreak}
              <span className="text-sm font-semibold text-site-body-muted">
                {currentStreak === 1 ? 'dia' : 'dias'}
              </span>
            </p>
            <p className="m-0 text-xs text-site-body-muted">
              Recorde: {longestStreak} {longestStreak === 1 ? 'dia' : 'dias'}
            </p>
          </Stat>

          <Stat label="Contribuições">
            <p className="m-0 text-2xl font-bold leading-none text-site-foreground">
              {formatNumber(totalContributions)}
            </p>
            <p className="m-0 text-xs text-site-body-muted">no último ano</p>
          </Stat>

          <Stat label="Último commit">
            {lastActivity ? (
              <>
                <Link
                  href={lastActivity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="m-0 block max-w-full break-words text-sm font-bold leading-snug text-site-foreground no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none sm:truncate"
                  title={lastActivity.message}
                >
                  {lastActivity.message}
                </Link>
                <p className="m-0 max-w-full break-words text-xs text-site-body-muted sm:truncate">
                  {lastActivity.repo} · {formatRelativeTime(lastActivity.at)}
                </p>
              </>
            ) : (
              <p className="m-0 text-sm text-site-body-muted">
                Sem atividade pública recente.
              </p>
            )}
          </Stat>
        </div>
      </Card>
    </section>
  );
}
