"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/lib/i18n/actions";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { code: "en", label: "EN" },
  { code: "bn", label: "বাং" },
];

export function LanguageSwitch() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const [pending, start] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="inline-flex overflow-hidden rounded-[10px] border-[1.5px] bg-card"
    >
      {OPTIONS.map((o) => {
        const active = locale === o.code;
        return (
          <button
            key={o.code}
            type="button"
            aria-pressed={active}
            disabled={pending}
            onClick={() =>
              start(async () => {
                await setLocale(o.code);
              })
            }
            className={cn(
              "px-3 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-primary",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
