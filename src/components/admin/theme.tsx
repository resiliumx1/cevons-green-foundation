import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/** Manifest modes for CEVONS Website Admin. Dark is the design default. */
export type CrmTheme = "dark" | "light";

const STORAGE_KEY = "cevons-admin-theme";
const DEFAULT_THEME: CrmTheme = "dark";

type ThemeCtx = {
  theme: CrmTheme;
  setTheme: (t: CrmTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

/**
 * First load follows prefers-color-scheme; after that the user's explicit
 * choice wins and persists per browser profile.
 */
function readInitialTheme(): CrmTheme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    // ignore
  }
  try {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  } catch {
    // ignore
  }
  return DEFAULT_THEME;
}

export function CrmThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<CrmTheme>(DEFAULT_THEME);

  useEffect(() => {
    setThemeState(readInitialTheme());
  }, []);

  const setTheme = (t: CrmTheme) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark") }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useCrmTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: DEFAULT_THEME, setTheme: () => {}, toggleTheme: () => {} };
  }
  return ctx;
}

/** Guyana is UTC-4 year-round and does not observe DST. */
export const GEORGETOWN_TZ = "America/Guyana";

/** Renders a UTC instant in Georgetown time. Always label the result. */
export function formatGeorgetown(
  value: Date | string | number,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" },
): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: GEORGETOWN_TZ }).format(d);
}
