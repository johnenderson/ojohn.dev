import type { GithubLanguage } from '@/lib/github';

type LanguageStackProps = {
  languages: GithubLanguage[];
};

export const LanguageStack = ({ languages }: LanguageStackProps) => {
  if (languages.length === 0) return null;

  return (
    <div className="rounded-md border border-site-border-muted bg-site-card p-4 sm:p-5">
      <h3 className="m-0 text-base font-semibold text-site-foreground">
        Stack viva
      </h3>
      <p className="mb-5 mt-1 text-xs text-site-body-muted">
        Linguagens dos meus repositórios
      </p>

      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-site-card-hover">
        {languages.map((language) => (
          <div
            key={language.name}
            style={{
              width: `${language.percentage}%`,
              backgroundColor: language.color ?? 'var(--site-primary)',
            }}
            title={`${language.name} · ${language.percentage}%`}
          />
        ))}
      </div>

      <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-x-4 gap-y-2 p-0 sm:grid-cols-3">
        {languages.map((language) => (
          <li
            key={language.name}
            className="inline-flex min-w-0 items-center gap-1.5 text-xs"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor: language.color ?? 'var(--site-primary)',
              }}
            />
            <span className="min-w-0 truncate font-semibold text-site-foreground">
              {language.name}
            </span>
            <span className="shrink-0 text-site-body-muted">
              {language.percentage}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
