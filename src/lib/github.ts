import { unstable_cache } from 'next/cache';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_API_URL = 'https://api.github.com';
const DEFAULT_GITHUB_USERNAME = 'johnenderson';

// Dados do GitHub mudam pouco minuto a minuto; cacheamos o resultado por 30min.
const REVALIDATE_SECONDS = 60 * 30;

// Logs de diagnóstico do GitHub. Ative com GITHUB_DEBUG=true no ambiente.
const debugLog = (...args: unknown[]) => {
  if (process.env.GITHUB_DEBUG === 'true') {
    console.warn('[github-debug]', ...args);
  }
};

export type GithubActivity = {
  repo: string;
  message: string;
  url: string;
  at: string;
};

export type GithubPulse = {
  username: string;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  lastActivity: GithubActivity | null;
};

export type GithubLanguage = {
  name: string;
  color: string | null;
  percentage: number;
};

export type GithubFeedItem = {
  type: 'push' | 'pr' | 'release' | 'star' | 'create' | 'issue' | 'other';
  label: string;
  repo: string;
  url: string;
  at: string;
};

export type GithubStarredRepo = {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  topics: string[];
  starredAt: string;
};

export type GithubProject = {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: { name: string; color: string | null } | null;
  topics: string[];
  updatedAt: string;
};

export type GithubDev = {
  // Contribuições somadas por dia da semana (índice 0 = domingo … 6 = sábado).
  rhythm: number[] | null;
  languages: GithubLanguage[];
  activity: GithubFeedItem[];
};

type ContributionDay = {
  date: string;
  contributionCount: number;
};

type ContributionsResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number;
          weeks?: { contributionDays?: ContributionDay[] }[];
        };
      };
    };
  };
};

type LanguagesResponse = {
  data?: {
    user?: {
      repositories?: {
        nodes?: {
          languages?: {
            edges?: {
              size?: number;
              node?: { name?: string; color?: string };
            }[];
          };
        }[];
      };
    };
  };
};

type GithubEvent = {
  type?: string;
  created_at?: string;
  repo?: { name?: string };
  payload?: {
    head?: string;
    commits?: { sha?: string; message?: string }[];
    action?: string;
    ref_type?: string;
    pull_request?: { html_url?: string; merged?: boolean };
    release?: { html_url?: string; tag_name?: string };
    issue?: { html_url?: string };
  };
};

type PinnedItemsResponse = {
  data?: {
    user?: {
      pinnedItems?: {
        nodes?: {
          name?: string;
          description?: string | null;
          url?: string;
          stargazerCount?: number;
          forkCount?: number;
          primaryLanguage?: { name?: string; color?: string | null } | null;
          updatedAt?: string;
          repositoryTopics?: {
            nodes?: { topic?: { name?: string } }[];
          };
        }[];
      };
    };
  };
};

const PINNED_ITEMS_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: [REPOSITORY]) {
        nodes {
          ... on Repository {
            name
            description
            url
            stargazerCount
            forkCount
            primaryLanguage {
              name
              color
            }
            updatedAt
            repositoryTopics(first: 5) {
              nodes {
                topic {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CONTRIBUTIONS_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

const LANGUAGES_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      repositories(
        first: 100
        privacy: PUBLIC
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

const githubGraphql = async <T>(
  token: string,
  query: string,
  login: string,
): Promise<T | null> => {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { login } }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    debugLog(`graphql falhou: ${response.status} ${body}`);
    return null;
  }

  return (await response.json()) as T;
};

const computeStreaks = (days: ContributionDay[]) => {
  let longest = 0;
  let run = 0;

  for (const day of days) {
    if (day.contributionCount > 0) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  let current = 0;

  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].contributionCount > 0) {
      current += 1;
    } else if (index === days.length - 1) {
      // O dia de hoje ainda pode estar zerado sem quebrar a sequência.
      continue;
    } else {
      break;
    }
  }

  return { current, longest };
};

const computeWeekdayRhythm = (days: ContributionDay[]) => {
  const buckets = [0, 0, 0, 0, 0, 0, 0];

  for (const day of days) {
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
    buckets[weekday] += day.contributionCount;
  }

  return buckets;
};

const fetchContributionCalendar = async (login: string, token: string) => {
  const data = await githubGraphql<ContributionsResponse>(
    token,
    CONTRIBUTIONS_QUERY,
    login,
  );
  const calendar =
    data?.data?.user?.contributionsCollection?.contributionCalendar;

  if (!calendar) {
    debugLog('contributions sem calendário');
    return null;
  }

  return {
    totalContributions: calendar.totalContributions ?? 0,
    days: (calendar.weeks ?? []).flatMap((week) => week.contributionDays ?? []),
  };
};

const fetchLanguages = async (
  login: string,
  token: string,
): Promise<GithubLanguage[]> => {
  const data = await githubGraphql<LanguagesResponse>(
    token,
    LANGUAGES_QUERY,
    login,
  );
  const nodes = data?.data?.user?.repositories?.nodes ?? [];

  const totals = new Map<string, { size: number; color: string | null }>();

  for (const repo of nodes) {
    for (const edge of repo.languages?.edges ?? []) {
      const name = edge.node?.name;
      if (!name) continue;

      const previous = totals.get(name) ?? {
        size: 0,
        color: edge.node?.color ?? null,
      };
      previous.size += edge.size ?? 0;
      totals.set(name, previous);
    }
  }

  const top = [...totals.entries()]
    .map(([name, { size, color }]) => ({ name, color, size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 6);

  const shownTotal = top.reduce((sum, language) => sum + language.size, 0);

  if (shownTotal === 0) return [];

  const languages: GithubLanguage[] = top.map((language) => ({
    name: language.name,
    color: language.color,
    percentage: Math.round((language.size / shownTotal) * 100),
  }));

  // Distribui o resíduo de arredondamento na maior fatia para a soma das
  // linguagens exibidas fechar exatamente 100% (barra sem gap/overflow).
  const remainder =
    100 - languages.reduce((sum, language) => sum + language.percentage, 0);
  languages[0].percentage += remainder;

  return languages;
};

const mapEvent = (event: GithubEvent): GithubFeedItem | null => {
  const repo = event.repo?.name;
  const at = event.created_at;

  if (!repo || !at) return null;

  const repoUrl = `https://github.com/${repo}`;

  switch (event.type) {
    case 'PushEvent': {
      const count = event.payload?.commits?.length ?? 0;
      return {
        type: 'push',
        label: count > 1 ? `Push de ${count} commits` : 'Novo push',
        repo,
        url: repoUrl,
        at,
      };
    }
    case 'PullRequestEvent': {
      const action = event.payload?.action;
      const merged = event.payload?.pull_request?.merged;
      let label: string;
      if (action === 'merged' || (action === 'closed' && merged)) {
        label = 'Pull request mesclado';
      } else if (action === 'closed') {
        label = 'Pull request fechado';
      } else {
        label = 'Pull request aberto';
      }

      return {
        type: 'pr',
        label,
        repo,
        url: event.payload?.pull_request?.html_url ?? repoUrl,
        at,
      };
    }
    case 'ReleaseEvent':
      return {
        type: 'release',
        label: event.payload?.release?.tag_name
          ? `Release ${event.payload.release.tag_name}`
          : 'Nova release',
        repo,
        url: event.payload?.release?.html_url ?? repoUrl,
        at,
      };
    case 'WatchEvent':
      return { type: 'star', label: 'Favoritou', repo, url: repoUrl, at };
    case 'CreateEvent': {
      const refTypeLabels: Record<string, string> = {
        branch: 'branch',
        tag: 'tag',
        repository: 'repositório',
      };
      const refType = event.payload?.ref_type ?? 'repository';

      return {
        type: 'create',
        label: `Criou ${refTypeLabels[refType] ?? refType}`,
        repo,
        url: repoUrl,
        at,
      };
    }
    case 'IssuesEvent':
      return {
        type: 'issue',
        label:
          event.payload?.action === 'closed' ? 'Issue fechada' : 'Issue aberta',
        repo,
        url: event.payload?.issue?.html_url ?? repoUrl,
        at,
      };
    default:
      return null;
  }
};

const fetchPublicEvents = async (
  login: string,
  token: string,
): Promise<GithubEvent[]> => {
  // Sempre `events/public`: o site é público, então só expomos atividade
  // pública (nunca repositórios/commits privados).
  const response = await fetch(
    `${GITHUB_API_URL}/users/${login}/events/public?per_page=100`,
    {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    },
  );

  if (!response.ok) {
    debugLog(`events falhou: ${response.status}`);
    return [];
  }

  return (await response.json()) as GithubEvent[];
};

type GithubCommitResponse = {
  html_url?: string;
  commit?: {
    message?: string;
    author?: { date?: string };
  };
};

const fetchLastActivity = async (
  login: string,
  token: string,
): Promise<GithubActivity | null> => {
  const events = await fetchPublicEvents(login, token);
  const push = events.find(
    (event) =>
      event.type === 'PushEvent' &&
      Boolean(event.repo?.name) &&
      Boolean(event.payload?.head || event.payload?.commits?.length),
  );

  if (!push?.repo?.name) return null;

  const commits = push.payload?.commits ?? [];
  const lastCommit = commits.at(-1);
  const sha = lastCommit?.sha ?? push.payload?.head;
  const messageFromEvent = (lastCommit?.message ?? '').split('\n')[0].trim();

  // Use the message from the push event when available — no extra API call needed.
  // Fall back to fetching the commit detail only when the event payload omits the
  // message (e.g. force-pushes or truncated payloads from the GitHub Events API).
  if (messageFromEvent) {
    return {
      repo: push.repo.name,
      message: messageFromEvent,
      url: sha
        ? `https://github.com/${push.repo.name}/commit/${sha}`
        : `https://github.com/${push.repo.name}`,
      at: push.created_at ?? new Date().toISOString(),
    };
  }

  if (sha) {
    const commitResponse = await fetch(
      `${GITHUB_API_URL}/repos/${push.repo.name}/commits/${sha}`,
      {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      },
    );

    if (commitResponse.ok) {
      const commit = (await commitResponse.json()) as GithubCommitResponse;
      const message = (commit.commit?.message ?? '').split('\n')[0].trim();

      return {
        repo: push.repo.name,
        message: message || 'Novo commit',
        url:
          commit.html_url ??
          `https://github.com/${push.repo.name}/commit/${sha}`,
        at:
          commit.commit?.author?.date ??
          push.created_at ??
          new Date().toISOString(),
      };
    }
  }

  return {
    repo: push.repo.name,
    message: 'Novo commit',
    url: sha
      ? `https://github.com/${push.repo.name}/commit/${sha}`
      : `https://github.com/${push.repo.name}`,
    at: push.created_at ?? new Date().toISOString(),
  };
};

const loadGithubPulse = async (): Promise<GithubPulse | null> => {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME ?? DEFAULT_GITHUB_USERNAME;

  // Estado estável (sem credencial): pode ser cacheado tranquilamente.
  if (!token) {
    debugLog('GITHUB_TOKEN ausente no ambiente');
    return null;
  }

  // A atividade é opcional; uma falha nela não deve esconder o card.
  const [calendar, lastActivity] = await Promise.all([
    fetchContributionCalendar(username, token),
    fetchLastActivity(username, token).catch(() => null),
  ]);

  // Falha/instabilidade na fonte principal: lançamos para NÃO cachear o erro
  // por 30min — assim a próxima visita tenta de novo e o card se recupera
  // rápido (o unstable_cache não armazena resultados que lançam).
  if (!calendar) {
    debugLog('contribuições indisponíveis — não vamos cachear a falha');
    throw new Error('Falha ao carregar contribuições do GitHub');
  }

  const { current, longest } = computeStreaks(calendar.days);

  debugLog(
    `pulse ok: ${
      calendar.totalContributions
    } contrib, streak ${current}, lastActivity ${lastActivity ? 'sim' : 'não'}`,
  );

  return {
    username,
    totalContributions: calendar.totalContributions,
    currentStreak: current,
    longestStreak: longest,
    lastActivity,
  };
};

const loadGithubDev = async (): Promise<GithubDev | null> => {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME ?? DEFAULT_GITHUB_USERNAME;

  if (!token) {
    debugLog('GITHUB_TOKEN ausente no ambiente');
    return null;
  }

  const [calendar, languages, events] = await Promise.all([
    fetchContributionCalendar(username, token).catch(() => null),
    fetchLanguages(username, token).catch(() => []),
    fetchPublicEvents(username, token).catch(() => []),
  ]);

  const rhythm = calendar ? computeWeekdayRhythm(calendar.days) : null;
  const activity = events
    .map(mapEvent)
    .filter((item): item is GithubFeedItem => item !== null)
    .slice(0, 6);

  // Se nada veio, é instabilidade: lança para não cachear a falha por 30min.
  if (!rhythm && languages.length === 0 && activity.length === 0) {
    debugLog('dados de dev indisponíveis — não vamos cachear a falha');
    throw new Error('Falha ao carregar dados de dev do GitHub');
  }

  return { rhythm, languages, activity };
};

const loadGithubLanguages = async (): Promise<GithubLanguage[]> => {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME ?? DEFAULT_GITHUB_USERNAME;

  if (!token) return [];

  return fetchLanguages(username, token).catch(() => []);
};

const loadGithubProjects = async (): Promise<GithubProject[]> => {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME ?? DEFAULT_GITHUB_USERNAME;

  if (!token) {
    debugLog('GITHUB_TOKEN ausente — projetos indisponíveis');
    return [];
  }

  const data = await githubGraphql<PinnedItemsResponse>(
    token,
    PINNED_ITEMS_QUERY,
    username,
  );

  const nodes = data?.data?.user?.pinnedItems?.nodes ?? [];

  return nodes
    .filter((node) => Boolean(node.name))
    .map((node) => ({
      name: node.name!,
      description: node.description ?? null,
      url: node.url ?? `https://github.com/${username}/${node.name}`,
      stars: node.stargazerCount ?? 0,
      forks: node.forkCount ?? 0,
      language: node.primaryLanguage?.name
        ? {
            name: node.primaryLanguage.name,
            color: node.primaryLanguage.color ?? null,
          }
        : null,
      topics: (node.repositoryTopics?.nodes ?? [])
        .map((t) => t.topic?.name)
        .filter((name): name is string => Boolean(name)),
      updatedAt: node.updatedAt ?? new Date().toISOString(),
    }));
};

export const getGithubPulse = unstable_cache(
  loadGithubPulse,
  ['github-pulse', 'v2'],
  { revalidate: REVALIDATE_SECONDS },
);

export const getGithubDev = unstable_cache(
  loadGithubDev,
  ['github-dev', 'v1'],
  {
    revalidate: REVALIDATE_SECONDS,
  },
);

export const getGithubLanguages = unstable_cache(
  loadGithubLanguages,
  ['github-languages', 'v1'],
  {
    revalidate: REVALIDATE_SECONDS,
  },
);

type StarredApiItem = {
  starred_at?: string;
  repo?: {
    name?: string;
    full_name?: string;
    description?: string | null;
    html_url?: string;
    language?: string | null;
    stargazers_count?: number;
    topics?: string[];
  };
};

const loadGithubStarred = async (): Promise<GithubStarredRepo[]> => {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME ?? DEFAULT_GITHUB_USERNAME;

  if (!token) {
    debugLog('GITHUB_TOKEN ausente — starred indisponível');
    return [];
  }

  const response = await fetch(
    `${GITHUB_API_URL}/users/${username}/starred?sort=created&per_page=8`,
    {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.star+json',
      },
    },
  );

  if (!response.ok) {
    debugLog(`starred falhou: ${response.status}`);
    return [];
  }

  const items = (await response.json()) as StarredApiItem[];

  return items
    .filter((item) => Boolean(item.repo?.name))
    .map((item) => ({
      name: item.repo!.name!,
      fullName: item.repo!.full_name ?? item.repo!.name!,
      description: item.repo?.description ?? null,
      url: item.repo?.html_url ?? `https://github.com/${item.repo?.full_name}`,
      language: item.repo?.language ?? null,
      stars: item.repo?.stargazers_count ?? 0,
      topics: item.repo?.topics ?? [],
      starredAt: item.starred_at ?? new Date().toISOString(),
    }));
};

export const getGithubUsername = () =>
  process.env.GITHUB_USERNAME ?? DEFAULT_GITHUB_USERNAME;

export const getGithubProjects = unstable_cache(
  loadGithubProjects,
  ['github-projects', 'v1'],
  { revalidate: REVALIDATE_SECONDS },
);

export const getGithubStarred = unstable_cache(
  loadGithubStarred,
  ['github-starred', 'v1'],
  { revalidate: REVALIDATE_SECONDS },
);
