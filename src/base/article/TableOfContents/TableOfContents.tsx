'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

const NAVBAR_OFFSET = 96;
const ITEM_HEIGHT = 36; // h-8 (32px) + gap-1 (4px)

type Heading = {
  id: string;
  text: string;
  level: number;
};

type TableOfContentsProps = {
  variant?: 'desktop' | 'mobile';
};

export const TableOfContents = ({
  variant = 'desktop',
}: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useLayoutEffect(() => {
    const elements = Array.from(
      document.querySelectorAll(
        'article h2:not([data-toc-ignore]), article h3:not([data-toc-ignore])',
      ),
    );
    const parsed = elements
      .filter((el) => el.id)
      .map((el) => ({
        id: el.id,
        text: el.textContent ?? '',
        level: Number(el.tagName.charAt(1)),
      }));
    // Legitimate DOM read after mount — setState is unavoidable here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeadings(parsed);
    if (parsed.length > 0) setActiveId(parsed[0].id);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const headingEls = Array.from(
      document.querySelectorAll(
        'article h2:not([data-toc-ignore]), article h3:not([data-toc-ignore])',
      ),
    ) as HTMLElement[];

    const onScroll = () => {
      const top = headingEls.find(
        (el) => el.getBoundingClientRect().top >= NAVBAR_OFFSET,
      );
      if (top) setActiveId(top.id);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  const activeIdx = headings.findIndex((h) => h.id === activeId);
  const links = headings.map((heading) => (
    <a
      key={heading.id}
      href={`#${heading.id}`}
      onClick={(e) => {
        e.preventDefault();
        const el = document.getElementById(heading.id);
        if (el) {
          const top =
            el.getBoundingClientRect().top +
            window.scrollY -
            NAVBAR_OFFSET -
            24;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        setActiveId(heading.id);
      }}
      className={`flex h-8 items-center truncate text-base font-semibold no-underline transition-colors duration-200 ${
        heading.level === 3 ? 'pl-6' : 'pl-3'
      } ${
        activeId === heading.id
          ? 'text-site-primary'
          : 'text-site-body hover:text-site-primary-hover'
      }`}
    >
      {heading.text}
    </a>
  ));

  if (variant === 'mobile') {
    return (
      <details className="mb-8 rounded-md border border-site-border-muted bg-site-card p-4 lg:hidden">
        <summary className="cursor-pointer text-base font-semibold text-site-foreground">
          Nesse artigo
        </summary>
        <div className="mt-3 flex flex-col gap-1">{links}</div>
      </details>
    );
  }

  return (
    <aside
      className="sticky hidden h-fit w-full max-w-[18rem] shrink-0 flex-col gap-3 border-l border-site-border-subtle py-1 pl-5 lg:flex"
      style={{ top: '8rem' }}
    >
      <p className="m-0 text-base font-semibold text-site-foreground">
        Nesse artigo
      </p>
      <div className="relative flex flex-col gap-1">
        {links}

        {/* Moving active indicator bar — same as doce.sh */}
        <span
          className="absolute left-0 h-7 w-px bg-site-primary transition-all duration-300 ease-elastic"
          style={{ top: `${(activeIdx >= 0 ? activeIdx : 0) * ITEM_HEIGHT}px` }}
        />
      </div>
    </aside>
  );
};
