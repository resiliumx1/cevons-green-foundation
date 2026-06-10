import { useCurrency, type CurrencyCode } from "@/contexts/CurrencyContext";

export function CurrencyToggle({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  const options: { code: CurrencyCode; label: string }[] = [
    { code: "GYD", label: "G$" },
    { code: "USD", label: "US$" },
  ];

  return (
    <div
      role="group"
      aria-label="Currency"
      className={`relative inline-flex items-center rounded-full border border-cevons-border bg-white p-0.5 text-[12px] font-semibold shadow-soft ${className}`}
    >
      {options.map((o) => {
        const active = currency === o.code;
        return (
          <button
            key={o.code}
            type="button"
            onClick={() => setCurrency(o.code)}
            aria-pressed={active}
            aria-label={`Show prices in ${o.code}`}
            className={`relative z-10 px-2.5 py-1 rounded-full transition-colors duration-200 ${
              active ? "text-white" : "text-cevons-dark/70 hover:text-cevons-dark"
            }`}
          >
            {active && (
              <span
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-cevons-green shadow-[0_4px_12px_rgba(0,107,53,0.35)]"
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
