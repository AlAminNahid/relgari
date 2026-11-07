import {
  ArmchairIcon,
  LanguagesIcon,
  QrCodeIcon,
  ReceiptIcon,
  SearchIcon,
  TimerIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { FeatureItem } from "@/types/landing";
import { SectionHead } from "@/components/sections/landing/section-head";

const ICONS: LucideIcon[] = [
  SearchIcon,
  ArmchairIcon,
  TimerIcon,
  ReceiptIcon,
  QrCodeIcon,
  LanguagesIcon,
];

export function Features() {
  const t = useTranslations("features");
  const items = t.raw("items") as FeatureItem[];
  return (
    <section id="features" className="scroll-mt-20 pb-[84px]">
      <div className="mx-auto max-w-[1140px] px-5">
        <SectionHead
          eyebrow={t("eyebrow")}
          title={t("title")}
          body={t("body")}
        />
        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => {
            const Icon = ICONS[i];
            const red = i % 3 === 1;
            return (
              <article
                key={it.title}
                className="relative overflow-hidden rounded-2xl border bg-card p-6"
              >
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-1",
                    red ? "bg-brand-red" : "bg-primary",
                  )}
                />
                <div
                  className={cn(
                    "mb-3.5 grid size-11 place-items-center rounded-[11px]",
                    red
                      ? "bg-brand-red-soft text-brand-red"
                      : "bg-brand-soft text-primary",
                  )}
                >
                  <Icon className="size-6" />
                </div>
                <h3 className="mb-1.5 text-xl font-bold text-brand-deep">
                  {it.title}
                </h3>
                <p className="text-base text-muted-foreground">{it.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
