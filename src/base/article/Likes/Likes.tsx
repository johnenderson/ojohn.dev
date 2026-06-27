'use client';

import { FC, useSyncExternalStore } from 'react';

import useSWR from 'swr';

type LikesResponse = { count: number | null };

const jsonFetcher = (url: string): Promise<LikesResponse> =>
  fetch(url).then((r) => r.json());

const storageKey = (id: string) => `liked:${id}`;

// O localStorage é o "external store" do estado "você já curtiu". Lê-lo via
// useSyncExternalStore evita setState em effect e o hydration mismatch (o
// servidor não tem localStorage → snapshot do servidor é sempre false).
const LIKED_EVENT = 'article-like-change';

const subscribe = (callback: () => void) => {
  window.addEventListener(LIKED_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(LIKED_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};

const readLiked = (id: string) => {
  try {
    return localStorage.getItem(storageKey(id)) === '1';
  } catch {
    // localStorage indisponível (modo privado etc.) — trata como não curtido.
    return false;
  }
};

const markLiked = (id: string) => {
  try {
    localStorage.setItem(storageKey(id), '1');
    window.dispatchEvent(new Event(LIKED_EVENT));
  } catch {
    // ignora — o POST ainda é enviado, só não persistimos o estado local.
  }
};

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    aria-hidden="true"
    className="transition-transform duration-200 group-active:scale-90"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
  </svg>
);

export const Likes: FC<{ likesId: string }> = ({ likesId }) => {
  const endpoint = `/api/likes/${likesId}`;
  const { data, isLoading, mutate } = useSWR<LikesResponse>(
    endpoint,
    jsonFetcher,
    { revalidateOnFocus: false },
  );

  const liked = useSyncExternalStore(
    subscribe,
    () => readLiked(likesId),
    () => false,
  );

  // Likes desativado (sem Redis configurado) — não renderiza nada.
  if (data && data.count === null) return null;

  const count = data?.count ?? 0;

  const handleLike = () => {
    if (liked) return;
    markLiked(likesId);

    void mutate(
      async () => {
        const res = await fetch(endpoint, { method: 'POST' });
        return res.json();
      },
      {
        optimisticData: { count: count + 1 },
        revalidate: false,
        rollbackOnError: true,
      },
    );
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={liked}
      aria-pressed={liked}
      aria-label={liked ? 'Você curtiu este artigo' : 'Curtir este artigo'}
      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        liked
          ? 'cursor-default border-site-primary/40 bg-site-primary-soft text-site-primary'
          : 'border-site-border-subtle text-site-body-muted hover:border-site-primary/40 hover:text-site-primary'
      }`}
    >
      <HeartIcon filled={liked} />
      <span className="tabular-nums">{isLoading ? '—' : count}</span>
    </button>
  );
};
