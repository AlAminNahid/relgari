import type { Metadata } from "next";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { SearchBar } from "@/components/sections/landing/hero/search-bar";
import { DateStrip } from "@/components/sections/search/date-strip";
import { TrainCard } from "@/components/sections/search/train-card";
import { CLASS_KEYS, MAX_DAYS_AHEAD, type ClassKey } from "@/config/site";
import { addDays, bdToday, dateStringToUtc, isDateString } from "@/lib/dates";
import { stationName } from "@/lib/stations";
import { getStations } from "@/services/stations.server";
import { searchTrains } from "@/services/trains.server";

export const metadata: Metadata = { title: "Search trains" };

const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const params = await searchParams;
  const from = one(params.from)?.toUpperCase() ?? "";
  const to = one(params.to)?.toUpperCase() ?? "";
  const cls = CLASS_KEYS.find((key) => key === one(params.class)) as
    | ClassKey
    | undefined;

  const today = bdToday();
  const requested = one(params.date) ?? "";
  const date = isDateString(requested) ? requested : today;

  const [t, format, locale, stations, outcome] = await Promise.all([
    getTranslations("results"),
    getFormatter(),
    getLocale(),
    getStations(),
    from && to
      ? searchTrains(from, to, date)
      : Promise.resolve({
          ok: false as const,
          code: "VALIDATION_FAILED" as const,
        }),
  ]);

  const longDate = (value: string) =>
    format.dateTime(dateStringToUtc(value), {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    });
  const dateLink = (value: string) => {
    const query = new URLSearchParams({ from, to, date: value });
    if (cls) query.set("class", cls);
    return `/search?${query}`;
  };

  const data = outcome.ok ? outcome.data : null;
  let problem = "";
  if (!outcome.ok) {
    if (outcome.code === "DATE_OUT_OF_RANGE") {
      problem = t("dateOutOfRange", {
        days: MAX_DAYS_AHEAD,
        last: longDate(addDays(today, MAX_DAYS_AHEAD)),
      });
    } else if (outcome.code === "UNAVAILABLE" || outcome.code === "INTERNAL") {
      problem = t("unavailable");
    } else {
      problem = t("invalid");
    }
  } else if (!outcome.data.routeExists) {
    problem = t("noRoute", {
      from: stationName(outcome.data.from, locale),
      to: stationName(outcome.data.to, locale),
    });
  } else if (outcome.data.trains.length === 0) {
    problem = t("noTrainsDay", { date: longDate(date) });
  }

  return (
    <div className="mx-auto max-w-[1140px] px-5 pb-20 pt-7">
      <SearchBar
        key={`${from}-${to}-${date}`}
        stations={stations}
        compact
        initial={
          data
            ? { from: data.from, to: data.to, date, cls: cls ?? "shovan" }
            : undefined
        }
      />

      {data && (
        <>
          <div className="mt-8">
            <h1 className="text-[clamp(24px,3.4vw,32px)] font-extrabold leading-tight tracking-tight text-brand-deep">
              {stationName(data.from, locale)}
              <span className="mx-2.5 text-brand-red">→</span>
              {stationName(data.to, locale)}
            </h1>
            <p className="mt-1 text-[15.5px] text-muted-foreground">
              {longDate(date)}
              {data.trains.length > 0 &&
                ` · ${t("count", { count: data.trains.length })}`}
            </p>
          </div>
          <DateStrip
            today={today}
            selected={date}
            days={MAX_DAYS_AHEAD}
            href={dateLink}
          />
        </>
      )}

      {problem && (
        <p
          role="status"
          className="mt-6 rounded-2xl border bg-card px-5 py-8 text-center text-[16px] text-muted-foreground"
        >
          {problem}
        </p>
      )}

      {data && data.trains.length > 0 && (
        <>
          <p className="mt-5 text-[14px] text-muted-foreground">
            {t("releaseNote", { days: MAX_DAYS_AHEAD })}
          </p>
          <ul className="mt-3 flex flex-col gap-4">
            {data.trains.map((train) => (
              <li key={train.number}>
                <TrainCard train={train} preferred={cls} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
