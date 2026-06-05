'use client';

import { useEffect, useRef, useState } from 'react';

import { Theme, useTheme } from '@/base/components/Theme';

const FONT_SIZES = ['14px', '16px', '17px', '18px', '20px'];
const DEFAULT_FONT_SIZE = '17px';
const ELEVATOR_SPEED_KEY = 'elevator_speed';

const isFontSize = (value: string | null): value is typeof FONT_SIZES[number] =>
  value !== null && FONT_SIZES.includes(value);

function useLocalFontSize() {
  const [fontSize, setFontSizeState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_FONT_SIZE;
    const storedFontSize = localStorage.getItem('prose_font_size');
    return isFontSize(storedFontSize) ? storedFontSize : DEFAULT_FONT_SIZE;
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--prose-font-size', fontSize);
  }, [fontSize]);

  const setFontSize = (size: string) => {
    if (!isFontSize(size)) return;
    setFontSizeState(size);
    localStorage.setItem('prose_font_size', size);
  };

  return [fontSize, setFontSize] as const;
}

function useElevatorSpeed() {
  const [makeElevatorFaster, setMakeElevatorFasterState] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ELEVATOR_SPEED_KEY) === 'true';
  });

  const setMakeElevatorFaster = (enabled: boolean) => {
    setMakeElevatorFasterState(enabled);
    localStorage.setItem(ELEVATOR_SPEED_KEY, String(enabled));
  };

  return [makeElevatorFaster, setMakeElevatorFaster] as const;
}

/* ── Icons ── */
const GearIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PaletteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C17.5222 2 22 5.97778 22 10.8889C22 13.9556 19.5111 16.4444 16.4444 16.4444H14.4778C13.5556 16.4444 12.8111 17.1889 12.8111 18.1111C12.8111 18.5333 12.9778 18.9222 13.2333 19.2111C13.5 19.5111 13.6667 19.9 13.6667 20.3333C13.6667 21.2556 12.9 22 12 22C6.47778 22 2 17.5222 2 12C2 6.47778 6.47778 2 12 2ZM10.8111 18.1111C10.8111 16.0843 12.451 14.4444 14.4778 14.4444H16.4444C18.4065 14.4444 20 12.851 20 10.8889C20 7.1392 16.4677 4 12 4C7.58235 4 4 7.58235 4 12C4 16.19 7.2226 19.6285 11.324 19.9718C10.9948 19.4168 10.8111 18.7761 10.8111 18.1111ZM7.5 12C6.67157 12 6 11.3284 6 10.5C6 9.67157 6.67157 9 7.5 9C8.32843 9 9 9.67157 9 10.5C9 11.3284 8.32843 12 7.5 12ZM16.5 12C15.6716 12 15 11.3284 15 10.5C15 9.67157 15.6716 9 16.5 9C17.3284 9 18 9.67157 18 10.5C18 11.3284 17.3284 12 16.5 12ZM12 9C11.1716 9 10.5 8.32843 10.5 7.5C10.5 6.67157 11.1716 6 12 6C12.8284 6 13.5 6.67157 13.5 7.5C13.5 8.32843 12.8284 9 12 9Z" />
  </svg>
);

const TextSizeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M11.246 15H4.75416L2.75416 20H0.600098L7.0001 4H9.0001L15.4001 20H13.246L11.246 15ZM10.446 13L8.0001 6.88516L5.55416 13H10.446ZM21.0001 12.5351V12H23.0001V20H21.0001V19.4649C20.4118 19.8052 19.7287 20 19.0001 20C16.791 20 15.0001 18.2091 15.0001 16C15.0001 13.7909 16.791 12 19.0001 12C19.7287 12 20.4118 12.1948 21.0001 12.5351ZM19.0001 18C20.1047 18 21.0001 17.1046 21.0001 16C21.0001 14.8954 20.1047 14 19.0001 14C17.8955 14 17.0001 14.8954 17.0001 16C17.0001 17.1046 17.8955 18 19.0001 18Z" />
  </svg>
);

const SpeedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M13 6.82843V20H11V6.82843L5.63604 12.1924L4.22183 10.7782L12 3L19.7782 10.7782L18.364 12.1924L13 6.82843Z" />
  </svg>
);

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z" />
  </svg>
);

const MinusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M5 11V13H19V11H5Z" />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z" />
  </svg>
);

/* ── Theme selector with sliding pill ── */
const THEME_OPTIONS = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: <SunIcon /> },
  { value: 'dark', label: <MoonIcon /> },
] as const;

const PILL_WIDTH = 46; // px — w-[46px] per button
const PILL_GAP = 0;

const ThemeSelector = ({
  theme,
  setTheme,
}: {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) => {
  const activeIdx = THEME_OPTIONS.findIndex((o) => o.value === theme);
  const idx = Math.max(0, activeIdx);

  return (
    <div className="relative flex gap-0 rounded border border-site-border p-1">
      {/* sliding indicator */}
      <span
        className="absolute top-1 h-7 rounded bg-site-primary transition-all duration-300 ease-elastic"
        style={{
          width: PILL_WIDTH,
          left: `calc(0.25rem + ${idx * PILL_WIDTH}px)`,
        }}
      />
      {THEME_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          type="button"
          aria-label={`Tema ${opt.value}`}
          className={`relative z-10 flex h-7 cursor-pointer items-center justify-center rounded text-sm transition-colors duration-200 ${
            theme === opt.value
              ? 'text-site-primary-foreground'
              : 'text-site-body-muted hover:text-site-primary-hover'
          }`}
          style={{ width: PILL_WIDTH }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const Switch = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`flex h-5 w-9 shrink-0 items-center overflow-hidden rounded-full p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-primary ${
      checked ? 'bg-site-primary' : 'bg-site-border'
    }`}
  >
    <span
      className={`size-4 rounded-full transition-transform ${
        checked
          ? 'translate-x-4 bg-site-primary-foreground'
          : 'translate-x-0 bg-site-foreground'
      }`}
    />
  </button>
);

/* ── Main component ── */
export const PreferencesPanel = ({
  panelAlign = 'right',
  panelPosition = 'bottom',
}: {
  panelAlign?: 'left' | 'right';
  panelPosition?: 'top' | 'bottom';
}) => {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useLocalFontSize();
  const [makeElevatorFaster, setMakeElevatorFaster] = useElevatorSpeed();
  const panelRef = useRef<HTMLDivElement>(null);
  const panelPositionClass =
    panelPosition === 'top'
      ? 'bottom-[calc(100%+0.75rem)]'
      : 'top-[calc(100%+0.75rem)]';
  const panelAlignClass = panelAlign === 'left' ? 'left-0' : 'right-0';

  const fontSizeIdx = Math.max(FONT_SIZES.indexOf(fontSize), 0);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        e.target instanceof Node &&
        !panelRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const reset = () => {
    setTheme('dark');
    setFontSize(DEFAULT_FONT_SIZE);
    setMakeElevatorFaster(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        type="button"
        aria-label="Preferências"
        className={`flex items-center justify-center w-8 h-8 transition-colors duration-200 ${
          open
            ? 'text-site-primary'
            : 'text-site-body-muted hover:text-site-primary-hover'
        }`}
      >
        <GearIcon />
      </button>

      {open && (
        <div
          className={`prefs-panel absolute ${panelAlignClass} ${panelPositionClass} w-[calc(100dvw-3rem)] md:w-[26rem] rounded-lg border border-site-border shadow-2xl z-50 overflow-hidden`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-site-border-subtle">
            <p className="text-lg font-medium text-site-foreground m-0">
              Preferências
            </p>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {/* Theme */}
            <div className="flex items-center justify-between p-3 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-site-body-muted shrink-0">
                  <PaletteIcon />
                </span>
                <p className="text-sm text-site-foreground m-0">Tema</p>
              </div>
              <ThemeSelector theme={theme} setTheme={setTheme} />
            </div>

            {/* Font size */}
            <div className="flex items-center justify-between p-3 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-site-body-muted shrink-0">
                  <TextSizeIcon />
                </span>
                <div>
                  <p className="text-sm text-site-foreground m-0">
                    Tamanho do texto
                  </p>
                  <p className="text-xs text-site-body-muted m-0 -mt-px">
                    No blog e páginas com muito texto
                  </p>
                </div>
              </div>
              <div className="flex items-center shrink-0">
                <button
                  onClick={() => setFontSize(FONT_SIZES[fontSizeIdx - 1])}
                  type="button"
                  aria-label="Diminuir tamanho do texto"
                  disabled={fontSizeIdx === 0}
                  className="flex h-9 w-9 items-center justify-center rounded rounded-r-none border border-site-border bg-transparent text-site-body-muted hover:text-site-primary-hover hover:bg-site-primary-soft disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                >
                  <MinusIcon />
                </button>
                <span className="flex h-9 w-14 cursor-default items-center justify-center border-y border-site-border text-sm text-site-foreground select-none tabular-nums">
                  {fontSize}
                </span>
                <button
                  onClick={() => setFontSize(FONT_SIZES[fontSizeIdx + 1])}
                  type="button"
                  aria-label="Aumentar tamanho do texto"
                  disabled={fontSizeIdx === FONT_SIZES.length - 1}
                  className="flex h-9 w-9 items-center justify-center rounded rounded-l-none border border-site-border bg-transparent text-site-body-muted hover:text-site-primary-hover hover:bg-site-primary-soft disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                >
                  <PlusIcon />
                </button>
              </div>
            </div>

            {/* Elevator speed */}
            <div className="flex items-center justify-between p-3 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-site-body-muted shrink-0">
                  <SpeedIcon />
                </span>
                <p className="text-sm text-site-foreground m-0">
                  Deixar elevador mais rápido
                </p>
              </div>
              <Switch
                checked={makeElevatorFaster}
                onChange={setMakeElevatorFaster}
                label="Deixar elevador mais rápido"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-site-border-subtle flex justify-end">
            <button
              onClick={reset}
              type="button"
              className="text-sm text-site-body-muted hover:text-site-primary-hover transition-colors"
            >
              Redefinir preferências
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
