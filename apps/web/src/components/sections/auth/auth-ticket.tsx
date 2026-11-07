"use client";

import type { CSSProperties, ReactNode } from "react";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { DialogClose } from "@/components/ui/dialog";

function barcodeBars() {
  let seed = 11;
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  while (x < 150) {
    const w = next() < 0.4 ? 1 : next() < 0.7 ? 2 : 3;
    bars.push({ x, w });
    x += w + (next() < 0.3 ? 1 : next() < 0.7 ? 2 : 3);
  }
  return { bars, width: x };
}
const BARCODE = barcodeBars();

function MiniTrain() {
  return (
    <svg
      viewBox="0 0 128 22"
      aria-hidden="true"
      className="animate-auth-train absolute bottom-2.5 -left-36 w-32"
    >
      <rect x="1" y="3" width="36" height="14" rx="3" fill="#e3f1ea" />
      <rect x="40" y="3" width="36" height="14" rx="3" fill="#e3f1ea" />
      <path d="M79 17V6q0-3 3-3h24q8 0 14 8l7 3v5z" fill="#e2263b" />
      <path d="M104 5h6l7 6h-13z" fill="#e3f1ea" />
      {[7, 17, 27, 46, 56, 66].map((x) => (
        <rect key={x} x={x} y="7" width="6" height="5" fill="#00694b" />
      ))}
      {[12, 30, 52, 70, 92, 118].map((x) => (
        <circle key={x} cx={x} cy="18" r="3" fill="#06382b" />
      ))}
    </svg>
  );
}

export function AuthTicket({
  tag,
  children,
}: {
  tag: string;
  children: ReactNode;
}) {
  const t = useTranslations("auth");
  const brand = useTranslations("brand");

  return (
    <div
      className="ticket-shape flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-[18px] bg-card"
      style={{ "--hh": "112px", "--sh": "64px" } as CSSProperties}
    >
      <header
        className="relative h-[var(--hh)] shrink-0 overflow-hidden px-[22px] pt-[18px] text-white"
        style={{
          background:
            "repeating-linear-gradient(45deg,rgba(255,255,255,.045) 0 2px,transparent 2px 11px), linear-gradient(135deg,var(--primary),var(--brand-deep))",
        }}
      >
        <DialogClose
          aria-label={t("close")}
          className="absolute right-3.5 top-3.5 z-10 grid size-[34px] place-items-center rounded-full bg-white/15 text-white outline-none transition-colors hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white"
        >
          <XIcon className="size-4" strokeWidth={2.6} />
        </DialogClose>
        <div className="relative z-[1] text-2xl font-extrabold leading-[1.1] tracking-tight">
          {brand("rel")}
          <em className="not-italic text-[#ff8a98]">{brand("gari")}</em>
        </div>
        <span className="relative z-[1] mt-2 inline-block rounded bg-brand-red px-2.5 py-[3px] font-mono text-[11px] font-medium uppercase tracking-[.1em]">
          {tag}
        </span>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-6 overflow-hidden"
        >
          <span className="absolute inset-x-0 bottom-[9px] h-[3px] bg-white/60" />
          <span
            className="absolute inset-x-0 bottom-0 h-[7px]"
            style={{
              background:
                "repeating-linear-gradient(90deg,rgba(255,255,255,.3) 0 6px,transparent 6px 16px)",
            }}
          />
          <MiniTrain />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-[26px] pb-5 pt-[22px]">
        {children}
      </div>

      <footer
        aria-hidden="true"
        className="flex h-[var(--sh)] shrink-0 items-center gap-4 border-t-2 border-dashed bg-background px-6"
      >
        <svg
          viewBox={`0 0 ${BARCODE.width} 34`}
          shapeRendering="crispEdges"
          className="h-[34px] w-auto shrink-0"
          fill="#10201a"
        >
          {BARCODE.bars.map((b) => (
            <rect key={b.x} x={b.x} y="0" width={b.w} height="34" />
          ))}
        </svg>
        <span className="font-mono text-[10.5px] uppercase leading-normal tracking-[.1em] text-muted-foreground">
          <b className="block font-medium text-brand-deep">{t("stubTitle")}</b>
          {t("stubSub")}
        </span>
      </footer>
    </div>
  );
}
