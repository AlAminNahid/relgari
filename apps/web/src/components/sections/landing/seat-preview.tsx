"use client";

import { useMemo, useState } from "react";
import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CoachMap } from "@/components/sections/seats/coach-map";
import type { SeatView } from "@/components/sections/seats/seat-button";
import { sampleCoach } from "@/config/coach-sample";
import { cn } from "@/lib/utils";
import type { SeatPoint } from "@/types/landing";

export function SeatPreview() {
  const t = useTranslations("seats");
  const points = t.raw("points") as SeatPoint[];
  const coach = useMemo(() => sampleCoach(), []);
  const [picked, setPicked] = useState<string[]>([]);

  const viewOf = (seat: { id: string; state: "free" | "taken" }): SeatView =>
    picked.includes(seat.id) ? "mine" : seat.state;

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

        <div className="rounded-[22px] border bg-background px-3 pb-5 pt-5 shadow-[0_24px_44px_-30px_rgba(6,56,43,.4)] sm:px-5">
          <div className="mb-3.5 flex items-center justify-between">
            <b className="text-lg font-bold text-brand-deep">{t("coach")}</b>
            <span className="rounded-full bg-brand-soft px-3 py-1 font-mono text-xs font-medium uppercase tracking-[.06em] text-primary">
              {t("preview")}
            </span>
          </div>
          <div
            role="group"
            aria-label={t("mapLabel")}
            className="relative max-h-[800px] overflow-hidden"
          >
            <CoachMap
              coach={coach}
              seatClass="schair"
              viewOf={viewOf}
              busyId={null}
              locked={false}
              onPick={(seat) =>
                setPicked((list) =>
                  list.includes(seat.id)
                    ? list.filter((id) => id !== seat.id)
                    : [...list, seat.id],
                )
              }
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
            />
          </div>
          <div className="mt-3.5 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <i className="size-4 rounded border-[1.5px] border-brand-deep/45 bg-card" />
              {t("free")}
            </span>
            <span className={cn("flex items-center gap-1.5")}>
              <i className="size-4 rounded border-[1.5px] border-primary bg-primary" />
              {t("selected")}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-4 rounded bg-[#d98f3e]" />
              {t("sold")}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("note")}</p>
        </div>
      </div>
    </section>
  );
}
