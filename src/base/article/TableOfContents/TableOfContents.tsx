'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const NAVBAR_OFFSET = 96;

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
  const [indicatorTop, setIndicatorTop] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

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

  // Update indicator position after activeId changes and DOM has settled
  useEffect(() => {
    if (!listRef.current) return;
    const activeIdx = headings.findIndex((h) => h.id === activeId);
    if (activeIdx < 0) return;
    const linkEl = listRef.current.querySelectorAll('a')[activeIdx] as
      | HTMLElement
      | undefined;
    if (linkEl)
      setIndicatorTop(linkEl.offsetTop + linkEl.offsetHeight / 2 - 14);
  }, [activeId, headings]);

  if (headings.length < 2) return null;

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
            globalThis.scrollY -
            NAVBAR_OFFSET -
            24;
          const prefersReducedMotion = globalThis.matchMedia(
            '(prefers-reduced-motion: reduce)',
          ).matches;
          globalThis.scrollTo({
            top,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          });
        }
        setActiveId(heading.id);
      }}
      className={`flex min-h-8 items-start py-1 rounded-sm pr-2 text-xs leading-snug no-underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-primary ${
        heading.level === 3 ? 'pl-6' : 'pl-3'
      } ${
        activeId === heading.id
          ? 'text-site-primary font-medium'
          : 'text-site-body-muted font-normal hover:text-site-foreground'
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
      className="sticky hidden h-fit w-full max-w-[13rem] xl:max-w-[16rem] shrink-0 flex-col gap-3 rounded-md border border-site-border-subtle bg-site-background/35 p-4 lg:flex"
      style={{ top: '7rem' }}
    >
      <p className="m-0 text-sm font-semibold text-site-foreground">
        Nesse artigo
      </p>
      <div
        ref={listRef}
        className="relative flex flex-col gap-0.5 border-l border-site-border-subtle"
      >
        {links}

        {/* Moving active indicator bar */}
        <span
          className="absolute left-0 h-4 w-px bg-site-primary transition-[top] duration-300 ease-elastic"
          style={{ top: `${indicatorTop}px` }}
        />
      </div>
    </aside>
  );
};
