"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { SeatPoint } from "@/types/landing";

const ROWS = 8;
const SOLD = new Set([2, 3, 6, 9, 10, 13, 14, 17, 22, 25, 26, 30]);

export function SeatPreview() {
  const t = useTranslations("seats");
  const points = t.raw("points") as SeatPoint[];
  const [picked, setPicked] = useState<number[]>([]);

  const toggle = (n: number) =>
    setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  let n = 0;
  const cells = Array.from(
    { length: ROWS },
    () => [0, 1, "aisle", 2, 3] as const,
  ).flatMap((row) => row.map((c) => (c === "aisle" ? null : ++n)));

  return (
    <section id="seats" className="scroll-mt-20 border-y bg-card py-[84px]">
      <div className="mx-auto grid max-w-[1140px] items-center gap-11 px-5 lg:grid-cols-2">
        <div>
          <div className="font-mono text-[12.5px] font-medium uppercase tracking-[.1em] text-primary">
            {t("eyebrow")}
          </div>
          <h2 className="mb-3 mt-2.5 text-[clamp(30px,4vw,44px)] font-extrabold leading-[1.1] tracking-tight text-brand-deep text-balance">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("body")}</p>
          <ul className="mt-5 grid gap-3">
            {points.map((p) => (
              <li
                key={p.b}
                className="flex items-start gap-3 text-muted-foreground"
              >
                <CheckIcon
                  className="mt-1 size-5 shrink-0 text-primary"
                  strokeWidth={3}
                />
                <span>
                  <b className="text-foreground">{p.b}</b> {p.t}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[22px] border bg-card px-[22px] pb-6 pt-5 shadow-[0_24px_44px_-30px_rgba(6,56,43,.4)]">
          <div className="mb-3.5 flex items-center justify-between">
            <b className="text-lg font-bold text-brand-deep">{t("coach")}</b>
            <span className="rounded-full bg-brand-soft px-3 py-1 font-mono text-xs font-medium uppercase tracking-[.06em] text-primary">
              {t("preview")}
            </span>
          </div>
          <div
            role="group"
            aria-label={t("mapLabel")}
            className="grid grid-cols-[repeat(2,1fr)_28px_repeat(2,1fr)] justify-items-center gap-2 rounded-[14px] border-2 bg-background p-3.5"
          >
            {cells.map((num, i) => {
              if (num === null) return <div key={`a${i}`} aria-hidden="true" />;
              const sold = SOLD.has(num);
              const on = picked.includes(num);
              return (
                <button
                  key={num}
                  type="button"
                  disabled={sold}
                  aria-pressed={sold ? undefined : on}
                  aria-label={
                    sold
                      ? t("seatSold", { n: num })
                      : t("seatLabel", { n: num })
                  }
                  onClick={() => toggle(num)}
                  className={cn(
                    "relative aspect-[1/1.05] w-full max-w-14 rounded-t-[10px] rounded-b-md border-2 font-mono text-[13.5px] font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
                    "after:absolute after:inset-x-[18%] after:bottom-[3px] after:h-[5px] after:rounded-[3px] after:bg-current after:opacity-25",
                    sold &&
                      "cursor-not-allowed border-[#c4cdc8] bg-[#e5e9e7] text-[#98a49e]",
                    !sold &&
                      !on &&
                      "border-primary bg-brand-soft text-brand-deep hover:bg-[#c8e6d9]",
                    on && "border-brand-red bg-brand-red text-white",
                  )}
                >
                  {num}
                </button>
              );
            })}
          </div>
          <div className="mt-3.5 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <i className="size-4 rounded border-2 border-primary bg-brand-soft" />
              {t("free")}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-4 rounded border-2 border-brand-red bg-brand-red" />
              {t("selected")}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-4 rounded border-2 border-[#c4cdc8] bg-[#e5e9e7]" />
              {t("sold")}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("note")}</p>
        </div>
      </div>
    </section>
  );
}
