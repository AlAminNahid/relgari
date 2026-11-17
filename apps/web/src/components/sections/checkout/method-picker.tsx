import { CheckIcon, CreditCardIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { METHOD_STYLE, WALLETS, type PaymentMethod } from "@/config/payment";
import { cn } from "@/lib/utils";

export function MethodMark({ method }: { method: PaymentMethod }) {
  const style = METHOD_STYLE[method];
  const base =
    "grid h-11 w-[76px] shrink-0 place-items-center rounded-lg text-white shadow-sm";

  if (method === "card") {
    return (
      <span className={cn(base, "gap-0 bg-brand-deep")} aria-hidden="true">
        <span className="flex flex-col items-center leading-none">
          <CreditCardIcon className="size-5" />
          <span className="mt-0.5 text-[8.5px] font-bold tracking-[.12em]">
            VISA · MC
          </span>
        </span>
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        base,
        "text-[17px] font-extrabold tracking-tight",
        method === "rocket" && "italic",
      )}
      style={{
        background:
          method === "nagad"
            ? "linear-gradient(135deg,#f6921e,#ec1c24)"
            : style.bg,
      }}
    >
      {style.name}
    </span>
  );
}

function MethodRow({
  method,
  active,
  onSelect,
}: {
  method: PaymentMethod;
  active: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations("checkout");
  const style = METHOD_STYLE[method];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-xl border-[1.5px] p-3 text-left outline-none transition-[background-color,border-color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring",
        active ? "shadow-sm" : "bg-background hover:border-foreground/30",
      )}
      style={
        active
          ? {
              borderColor: style.bg,
              background: `color-mix(in srgb, ${style.bg} 7%, white)`,
            }
          : undefined
      }
    >
      <MethodMark method={method} />
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] font-bold text-brand-deep">
          {style.name}
        </span>
        <span className="block text-[13px] leading-snug text-muted-foreground">
          {t(`methodDesc.${method}`)}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
          active ? "text-white" : "border-border bg-card",
        )}
        style={
          active ? { background: style.bg, borderColor: style.bg } : undefined
        }
      >
        {active && <CheckIcon className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}

export function MethodPicker({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  const t = useTranslations("checkout");
  return (
    <div role="radiogroup" aria-label={t("payWith")} className="mt-4 space-y-4">
      <div>
        <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[.08em] text-muted-foreground">
          {t("mobileBanking")}
        </p>
        <div className="space-y-2">
          {WALLETS.map((method) => (
            <MethodRow
              key={method}
              method={method}
              active={value === method}
              onSelect={() => onChange(method)}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[.08em] text-muted-foreground">
          {t("cards")}
        </p>
        <MethodRow
          method="card"
          active={value === "card"}
          onSelect={() => onChange("card")}
        />
      </div>
    </div>
  );
}
