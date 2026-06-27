import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  Accessibility,
  Check,
  DollarSign,
  Globe,
  Moon,
  Sun,
  SunMoon,
  Type,
  Zap,
} from "lucide-react";
import { useSettings, type ThemeMode, type Language, type TextSize } from "@/contexts/SettingsContext";
import { useCurrency, type CurrencyCode } from "@/contexts/CurrencyContext";

type Option<T extends string> = { value: T; label: string; icon?: React.ReactNode };

function SegGroup<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
  ariaLabel,
}: {
  label: string;
  icon: React.ReactNode;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-cevons-green dark:text-[#FFB070]">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-cevons-muted dark:text-white/70">
          {label}
        </span>
      </div>
      <div
        role="radiogroup"
        aria-label={ariaLabel ?? label}
        className="grid grid-flow-col auto-cols-fr gap-1 rounded-xl border border-cevons-border dark:border-white/10 bg-cevons-cream/60 dark:bg-white/[0.04] p-1"
      >
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`relative flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors min-h-9 ${
                active
                  ? "bg-cevons-green text-white shadow-[0_2px_8px_rgba(239,119,0,0.35)]"
                  : "text-cevons-dark dark:text-white/85 hover:bg-white dark:hover:bg-white/[0.06]"
              }`}
            >
              {o.icon}
              <span className="truncate">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SettingsMenu({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme, language, setLanguage, textSize, setTextSize, motion, setMotion, t } =
    useSettings();
  const { currency, setCurrency } = useCurrency();

  const themeOpts: Option<ThemeMode>[] = [
    { value: "light", label: t("settings.light"), icon: <Sun className="size-3.5" /> },
    { value: "dark", label: t("settings.dark"), icon: <Moon className="size-3.5" /> },
    { value: "system", label: t("settings.system"), icon: <SunMoon className="size-3.5" /> },
  ];
  const langOpts: Option<Language>[] = [
    { value: "en", label: t("settings.english") },
    { value: "es", label: t("settings.spanish") },
  ];
  const sizeOpts: Option<TextSize>[] = [
    { value: "normal", label: t("settings.normal") },
    { value: "large", label: t("settings.large") },
    { value: "larger", label: t("settings.larger") },
  ];
  const currencyOpts: Option<CurrencyCode>[] = [
    { value: "GYD", label: "G$" },
    { value: "USD", label: "US$" },
  ];

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={t("settings.open")}
          title={t("settings.open")}
          className={`inline-flex items-center justify-center size-10 rounded-full border border-cevons-border dark:border-white/15 bg-white dark:bg-white/[0.06] text-cevons-dark dark:text-white hover:bg-cevons-cream dark:hover:bg-white/10 hover:border-cevons-green transition-colors shadow-soft ${className}`}
        >
          <Accessibility className="size-[18px]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          collisionPadding={12}
          className="z-[300] w-[min(92vw,360px)] rounded-2xl border border-cevons-border dark:border-white/10 bg-white dark:bg-[#161616] text-cevons-dark dark:text-white shadow-[0_24px_48px_rgba(16,24,32,0.18)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="px-5 pt-5 pb-3 border-b border-cevons-border dark:border-white/10">
            <h2
              className="text-base font-extrabold tracking-tight"
              style={{ fontFamily: "Playfair Display, ui-serif, serif" }}
            >
              {t("settings.title")}
            </h2>
          </div>
          <div className="px-5 py-4 space-y-4 max-h-[min(80vh,560px)] overflow-y-auto">
            <SegGroup
              label={t("settings.theme")}
              icon={<Sun className="size-3.5" />}
              value={theme}
              onChange={setTheme}
              options={themeOpts}
            />
            <SegGroup
              label={t("settings.language")}
              icon={<Globe className="size-3.5" />}
              value={language}
              onChange={setLanguage}
              options={langOpts}
            />
            <SegGroup
              label={t("settings.currency")}
              icon={<DollarSign className="size-3.5" />}
              value={currency}
              onChange={setCurrency}
              options={currencyOpts}
            />
            <SegGroup
              label={t("settings.textSize")}
              icon={<Type className="size-3.5" />}
              value={textSize}
              onChange={setTextSize}
              options={sizeOpts}
            />

            {/* Reduce motion toggle */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cevons-green dark:text-[#FFB070]">
                  <Zap className="size-3.5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-cevons-muted dark:text-white/70">
                  {t("settings.reduceMotion")}
                </span>
              </div>
              <button
                role="switch"
                aria-checked={motion === "reduce"}
                onClick={() => setMotion(motion === "reduce" ? "auto" : "reduce")}
                className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  motion === "reduce"
                    ? "border-cevons-green bg-cevons-green/10"
                    : "border-cevons-border dark:border-white/10 bg-cevons-cream/60 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.06]"
                }`}
              >
                <span className="text-[13px] text-cevons-dark dark:text-white/85">
                  {t("settings.reduceMotionHint")}
                </span>
                <span
                  aria-hidden
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    motion === "reduce" ? "bg-cevons-green" : "bg-cevons-border dark:bg-white/15"
                  }`}
                >
                  <span
                    className={`inline-flex size-5 items-center justify-center rounded-full bg-white shadow transition-transform ${
                      motion === "reduce" ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  >
                    {motion === "reduce" && <Check className="size-3 text-cevons-green" />}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
