import { unstable_cache } from 'next/cache';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_API_URL = 'https://api.github.com';
const DEFAULT_GITHUB_USERNAME = 'johnenderson';

// Dados do GitHub mudam pouco minuto a minuto; cacheamos o resultado por 30min.
const REVALIDATE_SECONDS = 60 * 30;

// Logs de diagnóstico do Pulso de dev. Ative com GITHUB_DEBUG=true no ambiente.
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

type GithubPushEvent = {
  type?: string;
  repo?: { name?: string };
  created_at?: string;
  payload?: {
    head?: string;
    commits?: { sha?: string; message?: string }[];
  };
};

type GithubCommitResponse = {
  html_url?: string;
  commit?: {
    message?: string;
    author?: {
      date?: string;
    };
  };
};

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

const fetchContributions = async (login: string, token: string) => {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { login },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    debugLog(`contributions falhou: ${response.status} ${body}`);
    return null;
  }

  const data = (await response.json()) as ContributionsResponse;
  const calendar =
    data.data?.user?.contributionsCollection?.contributionCalendar;

  if (!calendar) {
    debugLog(
      `contributions sem calendário: ${JSON.stringify(data).slice(0, 400)}`,
    );
    return null;
  }

  const days = (calendar.weeks ?? []).flatMap(
    (week) => week.contributionDays ?? [],
  );
  const { current, longest } = computeStreaks(days);

  return {
    totalContributions: calendar.totalContributions ?? 0,
    currentStreak: current,
    longestStreak: longest,
  };
};

const fetchLastActivity = async (
  login: string,
  token: string,
): Promise<GithubActivity | null> => {
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

  if (!response.ok) return null;

  const events = (await response.json()) as GithubPushEvent[];
  const push = events.find(
    (event) =>
      event.type === 'PushEvent' &&
      Boolean(event.repo?.name) &&
      Boolean(event.payload?.head || event.payload?.commits?.length),
  );

  if (!push?.repo?.name) return null;

  const commits = push.payload?.commits ?? [];
  const lastCommit = commits[commits.length - 1];
  const sha = lastCommit?.sha ?? push.payload?.head;

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
      const message = (commit.commit?.message ?? lastCommit?.message ?? '')
        .split('\n')[0]
        .trim();

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

  const message = (lastCommit?.message ?? '').split('\n')[0].trim();

  return {
    repo: push.repo.name,
    message: message || 'Novo commit',
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
  const [contributions, lastActivity] = await Promise.all([
    fetchContributions(username, token),
    fetchLastActivity(username, token).catch(() => null),
  ]);

  // Falha/instabilidade na fonte principal: lançamos para NÃO cachear o erro
  // por 30min — assim a próxima visita tenta de novo e o card se recupera
  // rápido (o unstable_cache não armazena resultados que lançam).
  if (!contributions) {
    debugLog('contribuições indisponíveis — não vamos cachear a falha');
    throw new Error('Falha ao carregar contribuições do GitHub');
  }

  debugLog(
    `ok: ${contributions.totalContributions} contrib, streak ${
      contributions.currentStreak
    }, lastActivity ${lastActivity ? 'sim' : 'não'}`,
  );

  return {
    username,
    ...contributions,
    lastActivity,
  };
};

export const getGithubPulse = unstable_cache(
  loadGithubPulse,
  ['github-pulse', 'v2'],
  {
    revalidate: REVALIDATE_SECONDS,
  },
);
