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

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = 'theme';
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

const THEME_COLORS: Record<'light' | 'dark', string> = {
  light: '#fffdf9',
  dark: '#09080d',
};

// The themeColor metas from app/layout.tsx follow prefers-color-scheme, which
// is wrong when the user forces the opposite theme — pin them to the resolved
// theme instead.
const applyThemeColor = (resolvedTheme: 'light' | 'dark') => {
  const metas = globalThis.document.querySelectorAll<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  for (const meta of metas) {
    meta.content = THEME_COLORS[resolvedTheme];
  }
};

const applyTheme = (theme: Theme) => {
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
  const root = globalThis.document.documentElement;

  root.classList.remove('light', 'dark');
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;
  applyThemeColor(resolvedTheme);

  return resolvedTheme;
};

type ThemeProviderProps = Readonly<{
  children: ReactNode;
}>;

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getStoredTheme);

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

  const value = useMemo(
    () => ({ theme: currentTheme, setTheme }),
    [currentTheme, setTheme],
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
