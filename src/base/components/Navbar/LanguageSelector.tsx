'use client';

import { useEffect, useRef, useState } from 'react';

const GlobeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M9.00016 16.1716L19.5931 5.57861L21.0074 6.99282L9.00016 19L2.63623 12.636L4.05044 11.2218L9.00016 16.1716Z" />
  </svg>
);

export const LanguageSelector = ({
  panelAlign = 'right',
  panelPosition = 'bottom',
}: {
  panelAlign?: 'left' | 'right';
  panelPosition?: 'top' | 'bottom';
}) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelPositionClass =
    panelPosition === 'top'
      ? 'bottom-[calc(100%+0.75rem)]'
      : 'top-[calc(100%+0.75rem)]';
  const panelAlignClass = panelAlign === 'left' ? 'left-0' : 'right-0';

  useEffect(() => {
    if (!open) return;

    const handler = (event: MouseEvent) => {
      if (
        panelRef.current &&
        event.target instanceof Node &&
        !panelRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Selecionar idioma"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex h-8 w-8 items-center justify-center transition-colors duration-200 ${
          open
            ? 'text-site-primary'
            : 'text-site-body-muted hover:text-site-primary-hover'
        }`}
      >
        <GlobeIcon />
      </button>

      {open && (
        <div
          className={`prefs-panel absolute ${panelAlignClass} ${panelPositionClass} z-50 w-52 overflow-hidden rounded-lg border border-site-border shadow-2xl`}
        >
          <div className="border-b border-site-border-subtle px-3 py-3">
            <p className="m-0 text-sm font-medium text-site-foreground">
              Selecionar idioma:
            </p>
          </div>

          <div className="flex flex-col p-1.5">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex min-h-10 w-full cursor-not-allowed items-center gap-2 rounded px-2.5 text-left text-sm text-site-body-muted opacity-60"
            >
              <span aria-hidden="true">🇺🇸</span>
              <span>Inglês</span>
            </button>

            <button
              type="button"
              aria-current="true"
              onClick={() => setOpen(false)}
              className="flex min-h-10 w-full items-center gap-2 rounded px-2.5 text-left text-sm text-site-foreground transition-colors hover:bg-site-primary-soft hover:text-site-primary-hover"
            >
              <span aria-hidden="true">🇧🇷</span>
              <span>Português</span>
              <span className="ml-auto text-site-primary">
                <CheckIcon />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
