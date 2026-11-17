import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { addDays, dateStringToUtc } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function DateStrip({
  today,
  selected,
  days,
  href,
}: {
  today: string;
  selected: string;
  days: number;
  href: (date: string) => string;
}) {
  const t = useTranslations("results");
  const format = useFormatter();
  const dates = Array.from({ length: days + 1 }, (_, i) => addDays(today, i));

  return (
    <nav
      aria-label={t("otherDates")}
      className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1"
    >
      {dates.map((date) => {
        const active = date === selected;
        const utc = dateStringToUtc(date);
        return (
          <Link
            key={date}
            href={href(date)}
            aria-current={active ? "date" : undefined}
            className={cn(
              "flex min-w-[68px] shrink-0 flex-col items-center rounded-xl border-[1.5px] px-3 py-2 leading-tight outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:border-primary hover:bg-secondary",
            )}
          >
            <span
              className={cn(
                "text-[12.5px] font-medium",
                active ? "text-white/80" : "text-muted-foreground",
              )}
            >
              {date === today
                ? t("today")
                : format.dateTime(utc, { weekday: "short", timeZone: "UTC" })}
            </span>
            <span className="text-[17px] font-bold">
              {format.dateTime(utc, { day: "numeric", timeZone: "UTC" })}
            </span>
            <span
              className={cn(
                "text-[12.5px]",
                active ? "text-white/80" : "text-muted-foreground",
              )}
            >
              {format.dateTime(utc, { month: "short", timeZone: "UTC" })}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
