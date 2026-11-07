import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ClassItem } from "@/types/landing";
import { SectionHead } from "@/components/sections/landing/section-head";

const HEADER: Record<string, string> = {
  shovan: "bg-[#4f8a74]",
  schair: "bg-[#2f7c63]",
  snigdha: "bg-primary",
  ac: "bg-brand-red",
};

export function Classes() {
  const t = useTranslations("classes");
  const tc = useTranslations("classNames");
  const items = t.raw("items") as ClassItem[];
  return (
    <section className="pb-[84px]">
      <div className="mx-auto max-w-[1140px] px-5">
        <SectionHead
          eyebrow={t("eyebrow")}
          title={t("title")}
          body={t("body")}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((c) => (
            <article
              key={c.key}
              className="overflow-hidden rounded-[14px] border bg-card"
            >
              <h3
                className={cn(
                  "px-4 py-3.5 text-lg font-bold text-white",
                  HEADER[c.key],
                )}
              >
                {tc(c.key)}
              </h3>
              <div className="px-4 py-3.5 text-[15.5px] text-muted-foreground">
                <small className="mb-1 block font-mono text-xs uppercase text-primary">
                  {c.tag}
                </small>
                {c.text}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
