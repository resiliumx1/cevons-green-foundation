import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

export type ThemeMode = "light" | "dark" | "system";
export type Language = "en" | "es";
export type TextSize = "normal" | "large" | "larger";
export type MotionPref = "auto" | "reduce";

type Settings = {
  theme: ThemeMode;
  language: Language;
  textSize: TextSize;
  motion: MotionPref;
  setTheme: (t: ThemeMode) => void;
  setLanguage: (l: Language) => void;
  setTextSize: (s: TextSize) => void;
  setMotion: (m: MotionPref) => void;
  t: (key: string, fallback?: string) => string;
};

const SettingsContext = createContext<Settings | null>(null);
const KEYS = {
  theme: "cevons.theme",
  lang: "cevons.lang",
  textSize: "cevons.textSize",
  motion: "cevons.motion",
} as const;

const dictionaries: Record<Language, Record<string, unknown>> = { en, es };

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object" && k in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const effective =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  root.classList.toggle("dark", effective === "dark");
}

function applyTextSize(size: TextSize) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("text-size-normal", "text-size-large", "text-size-larger");
  root.classList.add(`text-size-${size}`);
}

function applyMotion(motion: MotionPref) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const reduce =
    motion === "reduce" ||
    (motion === "auto" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  root.classList.toggle("reduce-motion", reduce);
}

function applyLang(lang: Language) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("lang", lang);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [language, setLanguageState] = useState<Language>("en");
  const [textSize, setTextSizeState] = useState<TextSize>("normal");
  const [motion, setMotionState] = useState<MotionPref>("auto");

  // Load persisted preferences
  useEffect(() => {
    try {
      const t = localStorage.getItem(KEYS.theme) as ThemeMode | null;
      const l = localStorage.getItem(KEYS.lang) as Language | null;
      const s = localStorage.getItem(KEYS.textSize) as TextSize | null;
      const m = localStorage.getItem(KEYS.motion) as MotionPref | null;
      if (t === "light" || t === "dark" || t === "system") setThemeState(t);
      if (l === "en" || l === "es") setLanguageState(l);
      if (s === "normal" || s === "large" || s === "larger") setTextSizeState(s);
      if (m === "auto" || m === "reduce") setMotionState(m);
    } catch {}
  }, []);

  // Apply side effects
  useEffect(() => {
    applyTheme(theme);
    if (theme === "system" && typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => applyTheme("system");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, [theme]);

  useEffect(() => { applyLang(language); }, [language]);
  useEffect(() => { applyTextSize(textSize); }, [textSize]);
  useEffect(() => {
    applyMotion(motion);
    if (motion === "auto" && typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const onChange = () => applyMotion("auto");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, [motion]);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    try { localStorage.setItem(KEYS.theme, t); } catch {}
  }, []);
  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    try { localStorage.setItem(KEYS.lang, l); } catch {}
  }, []);
  const setTextSize = useCallback((s: TextSize) => {
    setTextSizeState(s);
    try { localStorage.setItem(KEYS.textSize, s); } catch {}
  }, []);
  const setMotion = useCallback((m: MotionPref) => {
    setMotionState(m);
    try { localStorage.setItem(KEYS.motion, m); } catch {}
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      const v = getByPath(dictionaries[language], key);
      if (typeof v === "string") return v;
      const fb = getByPath(dictionaries.en, key);
      if (typeof fb === "string") return fb;
      return fallback ?? key;
    },
    [language],
  );

  const value = useMemo(
    () => ({ theme, language, textSize, motion, setTheme, setLanguage, setTextSize, setMotion, t }),
    [theme, language, textSize, motion, setTheme, setLanguage, setTextSize, setMotion, t],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}

/** Convenience hook for translation-only consumers. */
export function useT() {
  return useSettings().t;
}
