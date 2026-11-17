"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftIcon, ClockIcon, TrainFrontIcon } from "lucide-react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { AuthDialog } from "@/components/sections/auth/auth-dialog";
import { CoachMap } from "@/components/sections/seats/coach-map";
import {
  HoldPanel,
  type LiveHold,
} from "@/components/sections/seats/hold-panel";
import type { SeatView } from "@/components/sections/seats/seat-button";
import { SEAT_CHECK_MS, SEAT_RELOAD_MS } from "@/config/site";
import { dateStringToUtc } from "@/lib/dates";
import { stationName } from "@/lib/stations";
import { cn } from "@/lib/utils";
import { ApiRequestError } from "@/services/http";
import { getLimit } from "@/services/bookings";
import {
  getSeatMap,
  getSeatVersion,
  holdSeat,
  listHolds,
  releaseHold,
  type SeatQuery,
} from "@/services/seats";
import type {
  AuthUser,
  Hold,
  PurchaseLimit,
  SeatInfo,
  SeatMap,
} from "@/types/api";
import { formatDhakaMoment, formatTime } from "@/lib/clock";

const live = (holds: Hold[]): LiveHold[] =>
  holds.map((hold) => ({
    ...hold,
    deadline: Date.now() + hold.secondsLeft * 1000,
  }));

export function SeatPicker({
  query,
  initialMap,
  user,
}: {
  query: SeatQuery;
  initialMap: SeatMap;
  user: AuthUser | null;
}) {
  const t = useTranslations("seatPage");
  const tc = useTranslations("classNames");
  const locale = useLocale();
  const format = useFormatter();

  const [map, setMap] = useState(initialMap);
  const [holds, setHolds] = useState<LiveHold[]>([]);
  const [limit, setLimit] = useState<PurchaseLimit | null>(null);
  const [coachIndex, setCoachIndex] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [releasing, setReleasing] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [authOpen, setAuthOpen] = useState(false);
  const pendingSeat = useRef<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const signedIn = user !== null;
  const here = useCallback(
    (hold: Hold) =>
      hold.train.number === query.train &&
      hold.from.code === query.from &&
      hold.to.code === query.to &&
      hold.date === query.date,
    [query],
  );

  const refresh = useCallback(async () => {
    try {
      const [nextMap, nextHolds, nextLimit] = await Promise.all([
        getSeatMap(query),
        signedIn ? listHolds() : Promise.resolve(null),
        signedIn ? getLimit() : Promise.resolve(null),
      ]);
      setMap(nextMap);
      if (nextHolds) setHolds(live(nextHolds));
      if (nextLimit) setLimit(nextLimit);
    } catch {}
  }, [query, signedIn]);

  useEffect(() => {
    const first = setTimeout(() => void refresh(), 0);
    const full = setInterval(() => void refresh(), SEAT_RELOAD_MS);
    let known: string | null = null;
    const check = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const { version } = await getSeatVersion(query);
        if (known !== null && version !== known) void refresh();
        known = version;
      } catch {}
    }, SEAT_CHECK_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(first);
      clearInterval(full);
      clearInterval(check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh, query]);

  useEffect(() => {
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      setHolds((list) => {
        const kept = list.filter((hold) => hold.deadline > current);
        if (kept.length === list.length) return list;
        void refresh();
        return kept;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [refresh]);

  const errorText = useCallback(
    (error: unknown) => {
      const code = error instanceof ApiRequestError ? error.code : "INTERNAL";
      const seconds =
        error instanceof ApiRequestError ? (error.retryAfter ?? 30) : 30;
      return t.has(`errors.${code}`)
        ? t(`errors.${code}`, { seconds })
        : t("errors.INTERNAL");
    },
    [t],
  );

  const allowance = limit
    ? Math.min(map.maxSeats, limit.remaining)
    : map.maxSeats;

  const toggle = useCallback(
    async (seat: SeatInfo) => {
      setError(undefined);
      if (!signedIn) {
        pendingSeat.current = seat.id;
        setAuthOpen(true);
        return;
      }
      const mine = holds.find((hold) => hold.seatId === seat.id);
      setBusyId(seat.id);
      try {
        if (mine) {
          await releaseHold(mine.id);
        } else {
          if (holds.length >= allowance) {
            setError(
              limit && limit.remaining < map.maxSeats
                ? t("errors.MONTHLY_LIMIT", { max: limit.max })
                : t("errors.HOLD_LIMIT", { max: map.maxSeats }),
            );
            return;
          }
          await holdSeat(query, seat.id);
        }
      } catch (e) {
        if (e instanceof ApiRequestError && e.code === "UNAUTHENTICATED") {
          pendingSeat.current = seat.id;
          setAuthOpen(true);
        } else {
          setError(errorText(e));
        }
      } finally {
        await refresh();
        setBusyId(null);
      }
    },
    [
      signedIn,
      holds,
      allowance,
      limit,
      map.maxSeats,
      query,
      refresh,
      errorText,
      t,
    ],
  );

  useEffect(() => {
    if (!signedIn || !pendingSeat.current) return;
    const id = pendingSeat.current;
    pendingSeat.current = null;
    const seat = map.coaches
      .flatMap((coach) => coach.seats)
      .find((s) => s.id === id);
    if (seat) setTimeout(() => void toggle(seat), 0);
  }, [signedIn, map.coaches, toggle]);

  async function release(hold: Hold) {
    setError(undefined);
    setReleasing(hold.id);
    try {
      await releaseHold(hold.id);
    } catch (e) {
      setError(errorText(e));
    } finally {
      await refresh();
      setReleasing(null);
    }
  }

  const mineHere = useMemo(
    () => new Set(holds.filter(here).map((hold) => hold.seatId)),
    [holds, here],
  );
  const viewOf = (seat: SeatInfo): SeatView =>
    mineHere.has(seat.id) ? "mine" : seat.state;

  const atLimit = signedIn && holds.length >= allowance;
  const noneOnSale = map.departed || map.availability.available === 0;
  const locked = atLimit || noneOnSale;
  const coach = map.coaches[Math.min(coachIndex, map.coaches.length - 1)];

  const monthDate = (date: string) =>
    format.dateTime(dateStringToUtc(date), {
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    });
  const when = (iso: string) => formatDhakaMoment(iso, locale);
  const results = `/search?${new URLSearchParams({
    from: query.from,
    to: query.to,
    date: query.date,
    class: query.cls,
  })}`;
  const trainName = locale === "bn" ? map.train.nameBn : map.train.nameEn;

  let notice = "";
  if (map.departed) notice = t("departed");
  else if (atLimit && limit && limit.remaining < map.maxSeats) {
    notice =
      limit.remaining === 0
        ? t("monthReached", { max: limit.max, date: monthDate(limit.resetsOn) })
        : t("monthHolding", { count: limit.remaining, max: limit.max });
  } else if (atLimit) notice = t("limitNote", { max: map.maxSeats });
  else if (map.availability.available === 0) {
    notice =
      map.availability.released === 0 && map.availability.nextReleaseAt
        ? t("notOpen", { when: when(map.availability.nextReleaseAt) })
        : map.availability.nextReleaseAt
          ? t("soldOutForNow", {
              count: map.availability.nextReleaseSeats,
              when: when(map.availability.nextReleaseAt),
            })
          : t("soldOut");
  }

  return (
    <div className="mx-auto max-w-[1140px] px-5 pb-20 pt-7">
      <Link
        href={results}
        className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline"
      >
        <ArrowLeftIcon className="size-4" />
        {t("back")}
      </Link>

      <header className="mt-4 rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--brand-deep)_70%)] p-5 text-white sm:p-6">
        <p className="flex items-center gap-2 font-mono text-[12.5px] uppercase tracking-[.08em] text-[#bcd6cc]">
          <TrainFrontIcon className="size-4" />
          {t("trainNo", {
            number: format.number(map.train.number, { useGrouping: false }),
          })}
        </p>
        <h1 className="mt-1 text-[clamp(24px,3.4vw,32px)] font-extrabold leading-tight tracking-tight">
          {trainName}
        </h1>
        <p className="mt-1 text-[17px]">
          {stationName(map.from, locale)}
          <span className="mx-2 text-[#ffb3bc]">→</span>
          {stationName(map.to, locale)}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2 text-[13.5px]">
          {[
            format.dateTime(dateStringToUtc(map.date), {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: "UTC",
            }),
            t("departs", { time: formatTime(map.departure, locale) }),
            tc(map.seatClass),
            t("fare", { fare: format.number(map.fare) }),
          ].map((chip) => (
            <li key={chip} className="rounded-full bg-white/12 px-3 py-1">
              {chip}
            </li>
          ))}
        </ul>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-label={t("mapLabel")}>
          <p
            role="status"
            className={cn(
              "mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-[14.5px]",
              notice
                ? "bg-brand-red-soft text-brand-red"
                : "bg-secondary text-brand-deep",
            )}
          >
            <ClockIcon className="mt-0.5 size-4 shrink-0" />
            <span>
              {notice ||
                t("available", {
                  count: map.availability.available,
                })}
              {!notice && map.availability.nextReleaseAt && (
                <span className="text-muted-foreground">
                  {" · "}
                  {t("moreAt", {
                    count: map.availability.nextReleaseSeats,
                    when: when(map.availability.nextReleaseAt),
                  })}
                </span>
              )}
            </span>
          </p>

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-brand-red/30 bg-brand-red-soft px-4 py-3 text-[14.5px] font-medium text-brand-red"
            >
              {error}
            </p>
          )}

          <div
            role="tablist"
            aria-label={t("coaches")}
            className="mb-4 flex flex-wrap gap-2"
          >
            {map.coaches.map((c, index) => {
              const free = c.seats.filter(
                (s) => s.state === "free" || mineHere.has(s.id),
              ).length;
              const active = c === coach;
              return (
                <button
                  key={c.code}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCoachIndex(index)}
                  className={cn(
                    "rounded-xl border-[1.5px] px-4 py-2 text-left leading-tight outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card hover:border-primary hover:bg-secondary",
                  )}
                >
                  <span className="block text-[15px] font-bold">
                    {t("coachLabel", { code: c.code })}
                  </span>
                  <span
                    className={cn(
                      "text-[12.5px]",
                      active ? "text-white/80" : "text-muted-foreground",
                    )}
                  >
                    {t("freeCount", { count: format.number(free) })}
                  </span>
                </button>
              );
            })}
          </div>

          <ul className="mb-4 flex flex-wrap gap-4 text-[13px] text-muted-foreground">
            {(
              [
                ["free", "border-primary/35 bg-card"],
                ["taken", "border-transparent bg-[#d98f3e]"],
                ["mine", "border-primary bg-primary"],
              ] as const
            ).map(([key, swatch]) => (
              <li key={key} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn("size-4 rounded border-[1.5px]", swatch)}
                />
                {t(`legend.${key}`)}
              </li>
            ))}
          </ul>

          {coach && (
            <div role="tabpanel">
              <CoachMap
                coach={coach}
                seatClass={map.seatClass}
                viewOf={viewOf}
                busyId={busyId}
                locked={locked}
                onPick={(seat) => void toggle(seat)}
              />
            </div>
          )}
        </section>

        <HoldPanel
          holds={holds}
          now={now}
          max={allowance}
          here={here}
          user={signedIn}
          releasing={releasing}
          onRelease={(hold) => void release(hold)}
          onLogin={() => setAuthOpen(true)}
        />
      </div>

      {holds.length > 0 && (
        <a
          href="#your-seats"
          className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between rounded-2xl bg-brand-deep px-4 py-3 text-white shadow-[0_14px_30px_-10px_rgba(6,56,43,.8)] lg:hidden"
        >
          <span className="text-[14.5px] font-semibold">
            {t("holding", {
              count: format.number(holds.length),
              max: format.number(allowance),
            })}
            {" · ৳"}
            {format.number(holds.reduce((sum, hold) => sum + hold.fare, 0))}
          </span>
          <span className="text-[14px] font-bold text-[#ffcf5a]">
            {t("viewSeats")}
          </span>
        </a>
      )}

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
