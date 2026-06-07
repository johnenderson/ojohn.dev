import Link from 'next/link';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { formatRelativeTime } from '@/lib/formatRelativeTime';
import type { GithubStarredRepo } from '@/lib/github';

type StarredRepoRowProps = {
  repo: GithubStarredRepo;
  priority?: boolean;
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
            <p className="m-0 mt-0.5 line-clamp-1 text-[11px] leading-5 text-site-body-muted">
              {repo.description}
            </p>
          )}
          {repo.topics.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {repo.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-site-border-subtle px-1.5 py-px text-[10px] font-medium leading-none text-site-body-muted"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1 text-right min-w-max">
          <span className="hidden rounded-full border border-site-border-subtle px-2 py-1 text-[10px] font-semibold leading-none text-site-body-muted sm:inline-flex">
            {formatRelativeTime(repo.starredAt)}
          </span>
          <div className="flex items-center gap-1 whitespace-nowrap">
            {repo.language && (
              <span className="text-[11px] font-medium text-site-body-muted">
                {repo.language}
              </span>
            )}
            {repo.stars > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-site-body-muted">
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
          </div>
        </div>
      </Link>
    </li>
  );
}

type StarredReposProps = {
  repos: GithubStarredRepo[];
};

export function StarredRepos({ repos }: Readonly<StarredReposProps>) {
  if (repos.length === 0) return null;

  return (
    <div className="rounded-md border border-site-border-muted bg-site-card p-4 sm:p-5">
      <h3 className="m-0 text-base font-semibold text-site-foreground">
        O que tenho curtido
      </h3>
      <p className="mb-2 mt-1 text-xs text-site-body-muted">
        Repositórios que marquei com estrela recentemente
      </p>

      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {repos.map((repo) => (
          <StarredRepoRow key={repo.fullName} repo={repo} />
        ))}
      </ul>
    </div>
  );
}
