import { useTranslations } from "next-intl";
import { SearchBar } from "@/components/sections/landing/hero/search-bar";
import { TicketPreview } from "@/components/sections/landing/hero/ticket-preview";
import { Track } from "@/components/sections/landing/hero/track";
import type { Station } from "@/types/api";

export function Hero({ stations }: { stations: Station[] }) {
  const t = useTranslations("hero");
  const points = t.raw("points") as string[];

  return (
    <section
      className="relative overflow-x-clip pt-14"
      style={{
        background:
          "radial-gradient(900px 400px at 85% -10%,var(--brand-soft),transparent 70%), radial-gradient(500px 300px at 0% 30%,var(--brand-red-soft),transparent 70%), var(--background)",
      }}
    >
      <div className="mx-auto grid max-w-[1140px] items-center gap-12 px-5 pb-10 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card py-1.5 pl-1.5 pr-3.5 text-sm text-muted-foreground">
            <b className="rounded-full bg-brand-red px-2.5 py-px text-[12.5px] font-semibold text-white">
              {t("badge")}
            </b>
            {t("badgeText")}
          </div>
          <h1 className="text-[clamp(38px,5.6vw,66px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-brand-deep text-balance">
            {t("title1")} <span className="text-brand-red">{t("title2")}</span>
          </h1>
          <p className="mt-[18px] max-w-[50ch] text-[19px] text-muted-foreground">
            {t("lead")}
          </p>
          <ul className="mt-[26px] flex flex-wrap gap-2">
            {points.map((p, i) => (
              <li
                key={p}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-[14.5px] text-muted-foreground"
              >
                <span
                  className={
                    i === 1
                      ? "size-2 rounded-full bg-brand-red"
                      : "size-2 rounded-full bg-primary"
                  }
                />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <TicketPreview />
      </div>

      <div className="relative z-10 mx-auto max-w-[1140px] px-5 pb-9">
        <SearchBar stations={stations} />
      </div>
      <Track />
    </section>
  );
}
