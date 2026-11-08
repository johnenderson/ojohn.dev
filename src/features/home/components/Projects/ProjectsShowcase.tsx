import Link from 'next/link';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCodeFork, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  SECTION_ACTION_CLASS,
  SectionHeader,
} from '@/base/components/SectionHeader';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import type { GithubProject } from '@/lib/github';
import { getGithubProjects, getGithubUsername } from '@/lib/github';

const formatCount = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

function ProjectRow({ project }: Readonly<{ project: GithubProject }>) {
  return (
    <li>
      <Link
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group -mx-3 flex flex-col gap-1 rounded-md px-3 py-3 no-underline transition-colors hover:bg-site-card focus-visible:bg-site-card focus-visible:outline-none sm:flex-row sm:items-baseline sm:gap-6"
      >
        <span className="min-w-0 truncate text-sm font-bold text-site-foreground transition-colors group-hover:text-site-primary-hover group-focus-visible:text-site-primary-hover sm:w-44 sm:shrink-0">
          {project.name}
        </span>

        <span className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug text-site-body-muted sm:line-clamp-1">
          {project.description ?? ''}
        </span>

        <span className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-site-body-muted">
          {project.language && (
            <span className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{
                  backgroundColor:
                    project.language.color ?? 'var(--site-primary)',
                }}
                aria-hidden="true"
              />
              {project.language.name}
            </span>
          )}

          {project.stars > 0 && (
            <span className="flex items-center gap-1">
              <FontAwesomeIcon
                icon={faStar}
                aria-hidden="true"
                className="text-[10px]"
              />
              {formatCount(project.stars)}
            </span>
          )}

          {project.forks > 0 && (
            <span className="flex items-center gap-1">
              <FontAwesomeIcon
                icon={faCodeFork}
                aria-hidden="true"
                className="text-[10px]"
              />
              {formatCount(project.forks)}
            </span>
          )}

          <span className="sm:w-20 sm:text-right">
            {formatRelativeTime(project.updatedAt)}
          </span>
        </span>
      </Link>
    </li>
  );
}

export async function ProjectsShowcase() {
  const [projects, username] = await Promise.all([
    getGithubProjects().catch(() => []),
    Promise.resolve(getGithubUsername()),
  ]);

  if (projects.length === 0) return null;

  return (
    <section
      id="projects"
      className="mt-12 border-t border-site-border-subtle pt-12 md:mt-14 md:pt-14"
    >
      <SectionHeader
        icon={
          <FontAwesomeIcon
            icon={faGithub}
            aria-hidden="true"
            className="size-4"
          />
        }
        title="Projetos em destaque"
        action={
          <Link
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className={SECTION_ACTION_CLASS}
          >
            Ver todos no GitHub →
          </Link>
        }
      />

      <ul className="m-0 flex list-none flex-col divide-y divide-site-border-subtle p-0">
        {projects.map((project) => (
          <ProjectRow key={project.name} project={project} />
        ))}
      </ul>
    </section>
  );
}
