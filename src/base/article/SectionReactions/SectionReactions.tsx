'use client';

import { FC, useEffect, useState, useSyncExternalStore } from 'react';

import { createPortal } from 'react-dom';
import useSWR, { type KeyedMutator } from 'swr';

import { ArticleReactions, REACTIONS, ReactionId } from '@/lib/reactions';

type ReactionsResponse = { reactions: ArticleReactions | null };

const jsonFetcher = (url: string): Promise<ReactionsResponse> =>
  fetch(url).then((r) => r.json());

const storageKey = (likesId: string, slug: string, reaction: ReactionId) =>
  `reacted:${likesId}:${slug}:${reaction}`;

// localStorage como "external store" do estado "você já reagiu" — mesmo
// padrão do Likes: evita setState em effect e hydration mismatch.
const REACTED_EVENT = 'article-reaction-change';

const subscribe = (callback: () => void) => {
  window.addEventListener(REACTED_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(REACTED_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};

const readReacted = (likesId: string, slug: string, reaction: ReactionId) => {
  try {
    return localStorage.getItem(storageKey(likesId, slug, reaction)) === '1';
  } catch {
    return false;
  }
};

const markReacted = (likesId: string, slug: string, reaction: ReactionId) => {
  try {
    localStorage.setItem(storageKey(likesId, slug, reaction), '1');
    window.dispatchEvent(new Event(REACTED_EVENT));
  } catch {
    // ignora — o POST ainda é enviado, só não persistimos o estado local.
  }
};

/** Novo estado com o contador da reação incrementado (ou fixado em `exact`). */
const bumpCount = (
  data: ReactionsResponse | undefined,
  slug: string,
  reaction: ReactionId,
  exact?: number,
): ReactionsResponse => {
  const reactions = data?.reactions ?? {};
  const section = reactions[slug] ?? {};
  const count = exact ?? (section[reaction] ?? 0) + 1;

  return {
    reactions: { ...reactions, [slug]: { ...section, [reaction]: count } },
  };
};

type ReactionButtonProps = {
  likesId: string;
  slug: string;
  reaction: typeof REACTIONS[number];
  count: number;
  onReact: (slug: string, reaction: ReactionId) => void;
};

const ReactionButton: FC<ReactionButtonProps> = ({
  likesId,
  slug,
  reaction,
  count,
  onReact,
}) => {
  const reacted = useSyncExternalStore(
    subscribe,
    () => readReacted(likesId, slug, reaction.id),
    () => false,
  );

  return (
    <button
      type="button"
      disabled={reacted}
      aria-pressed={reacted}
      aria-label={reaction.label}
      title={reaction.label}
      onClick={() => {
        if (reacted) return;
        markReacted(likesId, slug, reaction.id);
        onReact(slug, reaction.id);
      }}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
        reacted
          ? 'cursor-default border-site-primary/40 bg-site-primary-soft'
          : 'border-site-border-subtle hover:border-site-primary/40 hover:bg-site-primary-soft/50'
      }`}
    >
      <span aria-hidden="true">{reaction.emoji}</span>
      {count > 0 && (
        <span className="tabular-nums text-site-body-muted">{count}</span>
      )}
    </button>
  );
};

type ReactionBarProps = {
  likesId: string;
  slug: string;
  counts: ArticleReactions;
  onReact: (slug: string, reaction: ReactionId) => void;
};

const ReactionBar: FC<ReactionBarProps> = ({
  likesId,
  slug,
  counts,
  onReact,
}) => (
  <span className="inline-flex items-center gap-1.5">
    {REACTIONS.map((reaction) => (
      <ReactionButton
        key={reaction.id}
        likesId={likesId}
        slug={slug}
        reaction={reaction}
        count={counts[slug]?.[reaction.id] ?? 0}
        onReact={onReact}
      />
    ))}
  </span>
);

type Anchor = { slug: string; container: HTMLElement };

const createReact =
  (
    endpoint: string,
    mutate: KeyedMutator<ReactionsResponse>,
  ): ((slug: string, reaction: ReactionId) => void) =>
  (slug, reaction) => {
    void mutate(
      async (current) => {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, reaction }),
        });
        const json: { count: number | null } = await res
          .json()
          .catch(() => ({ count: null }));

        // 429 / erro: mantém o otimista — mesma postura do widget de likes.
        return bumpCount(
          current,
          slug,
          reaction,
          typeof json.count === 'number' ? json.count : undefined,
        );
      },
      {
        optimisticData: (current) => bumpCount(current, slug, reaction),
        revalidate: false,
        rollbackOnError: true,
      },
    );
  };

/**
 * Injeta uma barra de reações (👍 🔥 🤯) logo após cada h2 do artigo.
 * Os slugs vêm dos ids reais do DOM (gerados pelo rehype-slug), e o POST é
 * validado no servidor contra a whitelist de seções do artigo.
 */
export const SectionReactions: FC<{ likesId: string }> = ({ likesId }) => {
  const endpoint = `/api/reactions/${likesId}`;
  const [anchors, setAnchors] = useState<Anchor[]>([]);

  const { data, mutate } = useSWR<ReactionsResponse>(endpoint, jsonFetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    const headings = document.querySelectorAll<HTMLElement>(
      'article.post h2[id]',
    );

    const created = Array.from(headings).map((heading) => {
      const container = document.createElement('div');
      container.className = 'section-reactions mb-6 mt-2';
      heading.insertAdjacentElement('afterend', container);
      return { slug: heading.id, container };
    });

    // Leitura legítima do DOM pós-mount (padrão do TableOfContents).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnchors(created);

    return () => {
      created.forEach(({ container }) => container.remove());
      setAnchors([]);
    };
  }, []);

  // Desativado (sem Redis) ou ainda carregando — não renderiza nada.
  if (!data?.reactions) return null;

  const onReact = createReact(endpoint, mutate);

  return anchors.map(({ slug, container }) =>
    createPortal(
      <ReactionBar
        likesId={likesId}
        slug={slug}
        counts={data.reactions ?? {}}
        onReact={onReact}
      />,
      container,
      slug,
    ),
  );
};
