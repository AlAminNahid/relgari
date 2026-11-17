import { ClockIcon } from "lucide-react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import type { ClassKey } from "@/config/site";
import { cn } from "@/lib/utils";
import type { ClassAvailability, TrainResult } from "@/types/api";
import { formatDhakaMoment, formatTime } from "@/lib/clock";

function useClock() {
  const locale = useLocale();
  return (time: string) => formatTime(time, locale);
}

export interface Journey {
  from: string;
  to: string;
  date: string;
}

export function TrainCard({
  train,
  journey,
  preferred,
}: {
  train: TrainResult;
  journey: Journey;
  preferred?: ClassKey;
}) {
  const t = useTranslations("results");
  const tc = useTranslations("classNames");
  const locale = useLocale();
  const format = useFormatter();
  const clock = useClock();
  const missing =
    preferred && !train.classes.some((item) => item.seatClass === preferred);

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-[0_10px_30px_-22px_rgba(6,56,43,.5)] sm:p-5",
        train.departed && "opacity-70",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h2 className="truncate text-[19px] font-bold leading-tight text-brand-deep">
            {locale === "bn" ? train.nameBn : train.nameEn}
          </h2>
          <p className="mt-0.5 font-mono text-[13px] text-muted-foreground">
            {t("trainNo", {
              number: format.number(train.number, { useGrouping: false }),
            })}
          </p>
        </div>

        <div className="flex items-center gap-3 text-brand-deep">
          <time className="text-[22px] font-extrabold tabular-nums">
            {clock(train.departure)}
          </time>
          <span className="flex flex-col items-center text-[12.5px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <ClockIcon className="size-3.5" />
              {t("duration", {
                hours: Math.floor(train.durationMinutes / 60),
                minutes: train.durationMinutes % 60,
              })}
            </span>
            <span
              aria-hidden="true"
              className="mt-1 h-[2px] w-24 rounded bg-[linear-gradient(90deg,var(--primary),var(--brand-red))]"
            />
          </span>
          <span className="flex items-baseline gap-1.5">
            <time className="text-[22px] font-extrabold tabular-nums">
              {clock(train.arrival)}
            </time>
            {train.arrivalDayOffset > 0 && (
              <span className="rounded-full bg-brand-red-soft px-2 py-px text-[12px] font-semibold text-brand-red">
                {t("nextDay")}
              </span>
            )}
          </span>
        </div>
      </div>

      {train.departed ? (
        <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-[14.5px] font-medium text-muted-foreground">
          {t("departed")}
        </p>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {train.classes.map((item) => (
              <ClassTile
                key={item.seatClass}
                item={item}
                seatsHref={`/seats?${new URLSearchParams({
                  train: String(train.number),
                  from: journey.from,
                  to: journey.to,
                  date: journey.date,
                  class: item.seatClass,
                })}`}
                preferred={item.seatClass === preferred}
              />
            ))}
          </ul>
          {missing && (
            <p className="mt-2.5 text-[13.5px] text-muted-foreground">
              {t("noClass", { class: tc(preferred) })}
            </p>
          )}
        </>
      )}
    </article>
  );
}

function ClassTile({
  item,
  seatsHref,
  preferred,
}: {
  item: ClassAvailability;
  seatsHref: string;
  preferred: boolean;
}) {
  const t = useTranslations("results");
  const tc = useTranslations("classNames");
  const format = useFormatter();
  const locale = useLocale();

  const when = item.nextReleaseAt
    ? formatDhakaMoment(item.nextReleaseAt, locale)
    : "";

  let headline: string;
  let tone: string;
  let detail = "";
  if (item.available > 0) {
    headline = t("seats", { count: item.available });
    tone = "text-primary";
    if (when) detail = t("moreAt", { count: item.nextReleaseSeats, when });
  } else if (item.released === 0 && when) {
    headline = t("notOpen");
    tone = "text-[#9a6200]";
    detail = t("opensAt", { when });
  } else if (when) {
    headline = t("soldOutForNow");
    tone = "text-brand-red";
    detail = t("moreAt", { count: item.nextReleaseSeats, when });
  } else {
    headline = t("soldOut");
    tone = "text-brand-red";
  }

  return (
    <li
      className={cn(
        "rounded-xl border-[1.5px] bg-background px-3.5 py-3",
        preferred && "border-primary bg-secondary",
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[14.5px] font-semibold text-brand-deep">
          {tc(item.seatClass)}
        </span>
        <span className="text-[15.5px] font-bold tabular-nums text-brand-deep">
          ৳{format.number(item.fare)}
        </span>
      </div>
      <p className={cn("mt-1.5 text-[14.5px] font-bold", tone)}>{headline}</p>
      {detail && (
        <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
          {detail}
        </p>
      )}
      {item.available > 0 ? (
        <Link
          href={seatsHref}
          className="mt-2.5 flex h-9 items-center justify-center rounded-lg bg-primary text-[14px] font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("selectSeats")}
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="mt-2.5 flex h-9 items-center justify-center rounded-lg bg-muted text-[14px] font-semibold text-muted-foreground"
        >
          {t("selectSeats")}
        </span>
      )}
    </li>
  );
}
