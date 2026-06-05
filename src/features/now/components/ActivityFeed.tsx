import Link from 'next/link';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCircleDot,
  faCodeBranch,
  faCodeCommit,
  faStar,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { formatRelativeTime } from '@/lib/formatRelativeTime';
import type { GithubFeedItem } from '@/lib/github';

const ICONS: Record<GithubFeedItem['type'], IconDefinition> = {
  push: faCodeCommit,
  pr: faCodeBranch,
  release: faTag,
  star: faStar,
  create: faCodeBranch,
  issue: faCircleDot,
  other: faCodeCommit,
};

const formatRepoName = (repo: string) => repo.split('/').at(-1) ?? repo;

type ActivityFeedProps = {
  items: GithubFeedItem[];
};

export const ActivityFeed = ({ items }: ActivityFeedProps) => {
  if (items.length === 0) return null;

  return (
    <div className="rounded-md border border-site-border-muted bg-site-card p-4 sm:p-5">
      <h3 className="m-0 text-base font-semibold text-site-foreground">
        Em produção
      </h3>
      <p className="mb-2 mt-1 text-xs text-site-body-muted">
        Atividade pública recente no GitHub
      </p>

      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {items.map((item, index) => (
          <li key={`${item.type}-${item.repo}-${item.at}-${index}`}>
            <Link
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive-row group flex items-center gap-3 rounded-md p-2 no-underline"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-site-border-muted bg-site-card-hover text-site-primary">
                <FontAwesomeIcon
                  icon={ICONS[item.type]}
                  aria-hidden="true"
                  className="text-sm"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-sm font-bold leading-snug text-site-foreground transition-colors group-hover:text-site-primary-hover">
                  {formatRepoName(item.repo)}
                </p>
                <p className="m-0 truncate text-xs text-site-body-muted">
                  {item.label} · {item.repo}
                </p>
              </div>
              <span className="hidden shrink-0 rounded-full border border-site-border-subtle px-2 py-1 text-[11px] font-bold leading-none text-site-body-muted sm:inline-flex">
                {formatRelativeTime(item.at)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
