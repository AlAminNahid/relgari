"use client";

import type { ReactNode } from "react";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { TrainIcon } from "@/components/layout/logo";
import { DialogClose } from "@/components/ui/dialog";

export function AuthCard({ children }: { children: ReactNode }) {
  const t = useTranslations("auth");
  const brand = useTranslations("brand");

  return (
    <div className="relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl bg-card">
      <div aria-hidden="true" className="flex h-1.5 shrink-0">
        <span className="flex-1 bg-primary" />
        <span className="w-1/4 bg-brand-red" />
      </div>
      <DialogClose
        aria-label={t("close")}
        className="absolute right-3 top-[18px] grid size-9 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <XIcon className="size-[18px]" strokeWidth={2.4} />
      </DialogClose>
      <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-7 pt-6">
        <div className="mb-5 flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-brand-deep">
          <TrainIcon className="size-8 shrink-0" />
          <span>
            {brand("rel")}
            <em className="not-italic text-brand-red">{brand("gari")}</em>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
