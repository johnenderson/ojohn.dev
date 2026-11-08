'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Theme = 'system' | 'light' | 'dark';

/**
 * Paletas de cor escolhíveis no painel de Preferências. Os tokens de cada uma
 * ficam em styles/globals.css (html[data-palette=...]); 'lima' é o padrão.
 * Mantenha em sincronia com o paletteInitScript de app/layout.tsx.
 */
export const PALETTES = ['lima', 'ambar', 'teal'] as const;
export type Palette = (typeof PALETTES)[number];
export const DEFAULT_PALETTE: Palette = 'lima';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  palette: Palette;
  setPalette: (palette: Palette) => void;
};

const STORAGE_KEY = 'theme';
const PALETTE_STORAGE_KEY = 'palette';
const DEFAULT_THEME: Theme = 'dark';
const ThemeContext = createContext<ThemeContextValue | null>(null);

const isTheme = (value: string | null): value is Theme =>
  value === 'system' || value === 'light' || value === 'dark';

const getSystemTheme = () =>
  globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

const getStoredTheme = (): Theme => {
  if (typeof globalThis.window === 'undefined') return DEFAULT_THEME;
  try {
    const storedTheme = globalThis.localStorage.getItem(STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

const isPalette = (value: string | null): value is Palette =>
  PALETTES.includes(value as Palette);

const getStoredPalette = (): Palette => {
  if (typeof globalThis.window === 'undefined') return DEFAULT_PALETTE;
  try {
    const storedPalette = globalThis.localStorage.getItem(PALETTE_STORAGE_KEY);
    return isPalette(storedPalette) ? storedPalette : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
};

// The themeColor metas from app/layout.tsx follow prefers-color-scheme, which
// is wrong when the user forces the opposite theme — pin them to the page
// background actually in effect (it depends on both theme and palette).
const applyThemeColor = () => {
  const background = getComputedStyle(globalThis.document.documentElement)
    .getPropertyValue('--site-background')
    .trim();
  if (!background) return;

  const metas = globalThis.document.querySelectorAll<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  for (const meta of metas) {
    meta.content = background;
  }
};

const applyTheme = (theme: Theme) => {
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
  const root = globalThis.document.documentElement;

  root.classList.remove('light', 'dark');
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;
  applyThemeColor();

  return resolvedTheme;
};

const applyPalette = (palette: Palette) => {
  globalThis.document.documentElement.dataset.palette = palette;
  applyThemeColor();
};

type ThemeProviderProps = Readonly<{
  children: ReactNode;
}>;

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getStoredTheme);
  const [currentPalette, setCurrentPalette] =
    useState<Palette>(getStoredPalette);

  useEffect(() => {
    applyPalette(currentPalette);
  }, [currentPalette]);

  useEffect(() => {
    applyTheme(currentTheme);

    if (currentTheme !== 'system') return;

    const media = globalThis.window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [currentTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setCurrentTheme(nextTheme);
    try {
      globalThis.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {}
  }, []);

  const setPalette = useCallback((nextPalette: Palette) => {
    setCurrentPalette(nextPalette);
    try {
      globalThis.localStorage.setItem(PALETTE_STORAGE_KEY, nextPalette);
    } catch {}
  }, []);

  const value = useMemo(
    () => ({
      theme: currentTheme,
      setTheme,
      palette: currentPalette,
      setPalette,
    }),
    [currentTheme, setTheme, currentPalette, setPalette],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
