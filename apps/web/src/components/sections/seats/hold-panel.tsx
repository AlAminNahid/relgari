import { ClockIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { dateStringToUtc } from "@/lib/dates";
import { stationName } from "@/lib/stations";
import { cn } from "@/lib/utils";
import type { Hold } from "@/types/api";

export interface LiveHold extends Hold {
  deadline: number; // when the hold ends, on this device's clock
}

export function HoldPanel({
  holds,
  now,
  max,
  here,
  user,
  releasing,
  onRelease,
  onLogin,
}: {
  holds: LiveHold[];
  now: number;
  max: number;
  here: (hold: Hold) => boolean;
  user: boolean;
  releasing: string | null;
  onRelease: (hold: Hold) => void;
  onLogin: () => void;
}) {
  const t = useTranslations("seatPage");
  const tc = useTranslations("classNames");
  const format = useFormatter();
  const locale = useLocale();
  const total = holds.reduce((sum, hold) => sum + hold.fare, 0);

  const left = (hold: LiveHold) => {
    const seconds = Math.max(0, Math.ceil((hold.deadline - now) / 1000));
    const minutes = format.number(Math.floor(seconds / 60));
    const rest = format.number(seconds % 60, { minimumIntegerDigits: 2 });
    return { seconds, text: `${minutes}:${rest}` };
  };

  return (
    <aside
      id="your-seats"
      aria-label={t("yourSeats")}
      className="rounded-2xl border bg-card p-4 shadow-[0_10px_30px_-22px_rgba(6,56,43,.5)] sm:p-5 lg:sticky lg:top-24"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[18px] font-bold text-brand-deep">
          {t("yourSeats")}
        </h2>
        <span className="font-mono text-[12.5px] text-muted-foreground">
          {t("holding", {
            count: format.number(holds.length),
            max: format.number(max),
          })}
        </span>
      </div>

      {!user ? (
        <div className="mt-4 rounded-xl bg-secondary p-4">
          <p className="text-[15px] font-semibold text-brand-deep">
            {t("loginTitle")}
          </p>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {t("loginBody")}
          </p>
          <Button
            onClick={onLogin}
            className="mt-3 h-10 rounded-[10px] px-5 font-semibold"
          >
            {t("login")}
          </Button>
        </div>
      ) : holds.length === 0 ? (
        <p className="mt-4 rounded-xl bg-background px-4 py-5 text-[14.5px] text-muted-foreground">
          {t("empty", { minutes: 5 })}
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {holds.map((hold) => {
            const { seconds, text } = left(hold);
            return (
              <li
                key={hold.id}
                className="rounded-xl border bg-background px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 min-w-9 place-items-center rounded-lg bg-primary px-1 font-mono text-[13px] font-bold text-primary-foreground">
                    {hold.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-brand-deep">
                      {t("coachLabel", { code: hold.coach })} ·{" "}
                      {tc(hold.seatClass)}
                    </p>
                    <p
                      className={cn(
                        "flex items-center gap-1 text-[12.5px] tabular-nums text-muted-foreground",
                        seconds <= 60 && "font-semibold text-brand-red",
                      )}
                    >
                      <ClockIcon className="size-3.5" />
                      {t("timeLeft", { time: text })}
                    </p>
                  </div>
                  <span className="text-[14.5px] font-bold tabular-nums text-brand-deep">
                    ৳{format.number(hold.fare)}
                  </span>
                  <button
                    type="button"
                    aria-label={t("release", { label: hold.label })}
                    disabled={releasing === hold.id}
                    onClick={() => onRelease(hold)}
                    className="grid size-8 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-brand-red focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
                {!here(hold) && (
                  <p className="mt-2 border-t pt-2 text-[12.5px] text-muted-foreground">
                    {t("otherJourney", {
                      train:
                        locale === "bn" ? hold.train.nameBn : hold.train.nameEn,
                      from: stationName(hold.from, locale),
                      to: stationName(hold.to, locale),
                      date: format.dateTime(dateStringToUtc(hold.date), {
                        day: "numeric",
                        month: "short",
                        timeZone: "UTC",
                      }),
                    })}{" "}
                    <Link
                      href={`/seats?${new URLSearchParams({
                        train: String(hold.train.number),
                        from: hold.from.code,
                        to: hold.to.code,
                        date: hold.date,
                        class: hold.seatClass,
                      })}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {t("openOther")}
                    </Link>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {user && holds.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[14.5px] text-muted-foreground">
              {t("total")}
            </span>
            <b className="text-[22px] font-extrabold tabular-nums text-brand-deep">
              ৳{format.number(total)}
            </b>
          </div>
          <Link
            href="/checkout"
            className={cn(
              buttonVariants(),
              "mt-3 h-11 w-full rounded-xl bg-brand-red text-[15.5px] font-bold text-white hover:bg-brand-red/90",
            )}
          >
            {t("continue")}
          </Link>
        </div>
      )}
    </aside>
  );
}
