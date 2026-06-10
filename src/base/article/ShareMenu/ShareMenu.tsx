'use client';

import { useEffect, useRef, useState } from 'react';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBluesky,
  faFacebook,
  faLinkedin,
  faThreads,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { faCheck, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ShareIcon } from '@/base/article/icons';

const COPIED_RESET_MS = 1800;

type ShareMenuProps = {
  url: string;
  title: string;
  /** De que lado do botão o menu se abre. 'end' (direita) no header, 'start' (esquerda) no rodapé. */
  align?: 'start' | 'end';
};

type ShareTarget = {
  key: string;
  label: string;
  icon: IconDefinition;
  href: (url: string, title: string) => string;
};

const SHARE_TARGETS: ShareTarget[] = [
  {
    key: 'bluesky',
    label: 'Compartilhar no Bluesky',
    icon: faBluesky,
    href: (url, title) =>
      `https://bsky.app/intent/compose?text=${encodeURIComponent(
        `${title} ${url}`,
      )}`,
  },
  {
    key: 'facebook',
    label: 'Compartilhar no Facebook',
    icon: faFacebook,
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: 'linkedin',
    label: 'Compartilhar no LinkedIn',
    icon: faLinkedin,
    href: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url,
      )}`,
  },
  {
    key: 'threads',
    label: 'Compartilhar no Threads',
    icon: faThreads,
    href: (url, title) =>
      `https://www.threads.net/intent/post?text=${encodeURIComponent(
        `${title} ${url}`,
      )}`,
  },
  {
    key: 'x',
    label: 'Compartilhar no X',
    icon: faXTwitter,
    href: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url,
      )}&text=${encodeURIComponent(title)}`,
  },
];

const itemClass =
  'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-site-body transition-colors hover:bg-site-card-hover hover:text-site-foreground';

const iconClass = 'text-[1.0625rem] text-site-body-muted';

export const ShareMenu = ({ url, title, align = 'end' }: ShareMenuProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Compartilhar artigo"
        className="flex size-9 items-center justify-center rounded-full text-site-body-muted transition-colors hover:bg-site-card hover:text-site-foreground"
      >
        <ShareIcon />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute top-full z-30 mt-2 w-56 overflow-hidden rounded-lg border border-site-border bg-site-popover py-1 shadow-xl shadow-black/30 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 ${
            align === 'end' ? 'right-0' : 'left-0'
          }`}
        >
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className={itemClass}
          >
            <FontAwesomeIcon
              icon={copied ? faCheck : faLink}
              fixedWidth
              className={`text-[1.0625rem] ${
                copied ? 'text-site-primary' : 'text-site-body-muted'
              }`}
            />
            <span>{copied ? 'Link copiado' : 'Copiar link'}</span>
          </button>

          <div className="my-1 h-px bg-site-border-subtle" />

          {SHARE_TARGETS.map((target) => (
            <a
              key={target.key}
              role="menuitem"
              href={target.href(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <FontAwesomeIcon
                icon={target.icon}
                fixedWidth
                className={iconClass}
              />
              <span>{target.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
