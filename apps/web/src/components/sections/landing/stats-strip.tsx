import { useTranslations } from "next-intl";
import type { StatItem } from "@/types/landing";

export function StatsStrip() {
  const t = useTranslations();
  const items = t.raw("strip") as StatItem[];
  return (
    <section
      aria-label="Highlights"
      className="bg-brand-deep py-[26px] text-white"
    >
      <div className="mx-auto grid max-w-[1140px] grid-cols-2 gap-5 px-5 lg:grid-cols-4">
        {items.map((s) => (
          <div key={s.text}>
            <b className="block text-[30px] font-extrabold leading-tight">
              {s.value}
              <i className="ml-1 not-italic text-[#ff8a98]">{s.unit}</i>
            </b>
            <span className="text-[15px] text-[#bcd6cc]">{s.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
