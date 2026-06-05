import Link from 'next/link';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCodeFork, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Card } from '@/base/components/Card';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import type { GithubProject } from '@/lib/github';
import { getGithubProjects } from '@/lib/github';

const formatCount = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

function ProjectCard({ project }: Readonly<{ project: GithubProject }>) {
  return (
    <Card interactive className="group flex h-full flex-col gap-3 p-4 sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <Link
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 truncate text-sm font-bold text-site-foreground no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
          title={project.name}
        >
          {project.name}
        </Link>
        <FontAwesomeIcon
          icon={faGithub}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-sm text-site-body-muted transition-colors group-hover:text-site-primary"
        />
      </div>

      {project.description && (
        <p className="m-0 line-clamp-2 flex-1 text-xs leading-relaxed text-site-body-muted">
          {project.description}
        </p>
      )}

      {project.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-site-border-subtle px-2 py-0.5 text-[11px] font-medium leading-none text-site-body-muted"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-site-body-muted">
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
            <span>{project.language.name}</span>
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

        <span className="ml-auto">{formatRelativeTime(project.updatedAt)}</span>
      </div>
    </Card>
  );
}

export async function ProjectsShowcase() {
  const projects = await getGithubProjects().catch(() => []);

  if (projects.length === 0) return null;

  return (
    <section id="projects" className="mt-12 md:mt-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="m-0 text-base font-semibold text-site-foreground">
            Projetos em destaque
          </h2>
          <FontAwesomeIcon
            icon={faGithub}
            aria-hidden="true"
            className="text-site-body-muted"
          />
        </div>
        <Link
          href="https://github.com/johnenderson"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-site-body-muted no-underline transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover focus-visible:outline-none"
        >
          Ver todos no GitHub →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </section>
  );
}
