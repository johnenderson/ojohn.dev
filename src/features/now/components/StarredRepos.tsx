import Link from 'next/link';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { SECTION_ACTION_CLASS } from '@/base/components/SectionHeader';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import type { GithubStarredRepo } from '@/lib/github';

type StarredRepoRowProps = {
  repo: GithubStarredRepo;
};

function StarredRepoRow({ repo }: Readonly<StarredRepoRowProps>) {
  return (
    <li className="interactive-row group">
      <Link
        href={repo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 items-start gap-3 rounded-md p-2 no-underline antialiased"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-site-border-muted bg-site-card-hover text-site-primary">
          <FontAwesomeIcon
            icon={faGithub}
            aria-hidden="true"
            className="text-lg"
          />
        </span>

        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-sm font-semibold leading-5 text-site-foreground transition-colors group-hover:text-site-primary-hover">
            {repo.fullName}
          </p>
          {repo.description && (
            <p className="m-0 mt-0.5 line-clamp-2 text-xs leading-5 text-site-body-muted">
              {repo.description}
            </p>
          )}
          <p className="m-0 mt-1 flex flex-wrap items-center gap-x-3 text-xs text-site-body-muted">
            {repo.language && <span>{repo.language}</span>}
            {repo.stars > 0 && (
              <span className="inline-flex items-center gap-1">
                <FontAwesomeIcon
                  icon={faStar}
                  aria-hidden="true"
                  className="text-xs"
                />
                {repo.stars >= 1000
                  ? `${(repo.stars / 1000).toFixed(1)}k`
                  : repo.stars}
              </span>
            )}
            <span>{formatRelativeTime(repo.starredAt)}</span>
          </p>
        </div>
      </Link>
    </li>
  );
}

const VISIBLE_REPOS = 6;

type StarredReposProps = {
  repos: GithubStarredRepo[];
  /** Página com a lista completa de estrelas. */
  allHref: string;
};

export function StarredRepos({ repos, allHref }: Readonly<StarredReposProps>) {
  if (repos.length === 0) return null;

  return (
    <div className="rounded-md border border-site-border-muted bg-site-card p-4 sm:p-5">
      <h3 className="m-0 text-base font-semibold text-site-foreground">
        O que tenho curtido
      </h3>
      <p className="mb-2 mt-1 text-xs text-site-body-muted">
        Repositórios que marquei com estrela recentemente
      </p>

      <ul className="m-0 grid list-none grid-cols-1 gap-x-4 gap-y-1 p-0 md:grid-cols-2">
        {repos.slice(0, VISIBLE_REPOS).map((repo) => (
          <StarredRepoRow key={repo.fullName} repo={repo} />
        ))}
      </ul>

      <div className="flex justify-end">
        <Link
          href={allHref}
          target="_blank"
          rel="noopener noreferrer"
          className={SECTION_ACTION_CLASS}
        >
          Ver todas no GitHub →
        </Link>
      </div>
    </div>
  );
}
