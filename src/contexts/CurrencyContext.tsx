import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CurrencyCode = "GYD" | "USD";

// Approximate working rate; treat GYD as the base/source price.
// 1 USD ~ 210 GYD. Adjust here if a live rate is wired in later.
const GYD_PER_USD = 210;

type Ctx = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  toggle: () => void;
  format: (gydAmount: number, opts?: { compact?: boolean }) => string;
  convert: (gydAmount: number) => number;
};

const CurrencyContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "cevons.currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("GYD");

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "GYD" || v === "USD") setCurrencyState(v);
    } catch {}
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch {}
  }, []);

  const toggle = useCallback(() => {
    setCurrency(currency === "GYD" ? "USD" : "GYD");
  }, [currency, setCurrency]);

  const convert = useCallback((gyd: number) => {
    return currency === "GYD" ? gyd : gyd / GYD_PER_USD;
  }, [currency]);

  const format = useCallback((gyd: number, opts?: { compact?: boolean }) => {
    const value = convert(gyd);
    if (currency === "GYD") {
      const n = new Intl.NumberFormat("en-GY", {
        maximumFractionDigits: 0,
        notation: opts?.compact ? "compact" : "standard",
      }).format(Math.round(value));
      return `G$${n}`;
    }
    const n = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value < 100 ? 2 : 0,
      notation: opts?.compact ? "compact" : "standard",
    }).format(value);
    return n;
  }, [currency, convert]);

  const value = useMemo(() => ({ currency, setCurrency, toggle, format, convert }), [currency, setCurrency, toggle, format, convert]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside <CurrencyProvider>");
  return ctx;
}

/** Render a price stored in GYD; auto-converts and formats to the active currency. */
export function Price({ gyd, compact, className }: { gyd: number; compact?: boolean; className?: string }) {
  const { format } = useCurrency();
  return <span className={className}>{format(gyd, { compact })}</span>;
}
