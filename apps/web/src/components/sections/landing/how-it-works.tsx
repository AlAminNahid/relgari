import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { StepItem } from "@/types/landing";
import { SectionHead } from "@/components/sections/landing/section-head";

export function HowItWorks() {
  const t = useTranslations("how");
  const steps = t.raw("steps") as StepItem[];
  const numberFormat = new Intl.NumberFormat(
    useLocale() === "bn" ? "bn-BD" : "en-US",
  );
  return (
    <section id="how" className="scroll-mt-20 py-[84px]">
      <div className="mx-auto max-w-[1140px] px-5">
        <SectionHead eyebrow={t("eyebrow")} title={t("title")} />
        <ol className="relative grid list-none gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-[27px] hidden h-1 opacity-35 lg:block"
            style={{
              background:
                "repeating-linear-gradient(90deg,var(--primary) 0 14px,transparent 14px 22px)",
            }}
          />
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <div
                className={cn(
                  "relative mb-3.5 grid size-14 place-items-center rounded-full border-[5px] border-background text-[22px] font-extrabold text-white",
                  i === steps.length - 1 ? "bg-brand-red" : "bg-primary",
                )}
              >
                {numberFormat.format(i + 1)}
              </div>
              <h3 className="mb-1 text-[19px] font-bold text-brand-deep">
                {s.title}
              </h3>
              <p className="text-[15.5px] text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
