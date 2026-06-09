import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CrmTheme = "emerald" | "sunset";

const STORAGE_KEY = "cevons-crm-theme";
const DEFAULT_THEME: CrmTheme = "emerald";

type ThemeCtx = {
  theme: CrmTheme;
  setTheme: (t: CrmTheme) => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

function readStoredTheme(): CrmTheme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "emerald" || v === "sunset") return v;
  } catch {
    // ignore
  }
  return DEFAULT_THEME;
}

export function CrmThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<CrmTheme>(DEFAULT_THEME);

  useEffect(() => {
    setThemeState(readStoredTheme());
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
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useCrmTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: DEFAULT_THEME, setTheme: () => {} };
  }
  return ctx;
}
