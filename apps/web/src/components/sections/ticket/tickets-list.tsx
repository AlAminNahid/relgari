"use client";

import { useState } from "react";
import { TicketIcon } from "lucide-react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/sections/ticket/status-badge";
import { METHOD_STYLE } from "@/config/payment";
import { dateStringToUtc } from "@/lib/dates";
import { stationName } from "@/lib/stations";
import { cn } from "@/lib/utils";
import type { Booking, PurchaseLimit } from "@/types/api";
import { formatTime } from "@/lib/clock";

type Tab = "upcoming" | "past" | "cancelled";

const TAB_OF = (booking: Booking): Tab =>
  booking.status === "cancelled"
    ? "cancelled"
    : booking.status === "departed"
      ? "past"
      : "upcoming";

export function TicketsList({
  bookings,
  limit,
}: {
  bookings: Booking[];
  limit: PurchaseLimit | null;
}) {
  const t = useTranslations("ticketsPage");
  const tc = useTranslations("classNames");
  const format = useFormatter();
  const locale = useLocale();

  const groups: Record<Tab, Booking[]> = {
    upcoming: [],
    past: [],
    cancelled: [],
  };
  for (const booking of bookings) groups[TAB_OF(booking)].push(booking);
  groups.upcoming.sort((a, b) => a.departureAt.localeCompare(b.departureAt));
  groups.past.sort((a, b) => b.departureAt.localeCompare(a.departureAt));
  groups.cancelled.sort((a, b) => b.departureAt.localeCompare(a.departureAt));

  const [tab, setTab] = useState<Tab>(
    groups.upcoming.length === 0 && groups.past.length > 0
      ? "past"
      : "upcoming",
  );
  const shown = groups[tab];
  const taka = (value: number) => `৳${format.number(value)}`;

  return (
    <div className="mx-auto max-w-[820px] px-5 pb-20 pt-9">
      <h1 className="text-[clamp(26px,3.6vw,34px)] font-extrabold tracking-tight text-brand-deep">
        {t("title")}
      </h1>

      {limit && (
        <p
          className={cn(
            "mt-3 inline-block rounded-full px-4 py-1.5 text-[14px] font-medium",
            limit.remaining === 0
              ? "bg-brand-red-soft text-brand-red"
              : "bg-secondary text-brand-deep",
          )}
        >
          {t("limit", {
            used: limit.used,
            max: limit.max,
            date: format.dateTime(dateStringToUtc(limit.resetsOn), {
              day: "numeric",
              month: "long",
              timeZone: "UTC",
            }),
          })}
        </p>
      )}

      <div role="tablist" aria-label={t("title")} className="mt-5 flex gap-2">
        {(["upcoming", "past", "cancelled"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full border-[1.5px] px-4 py-1.5 text-[14.5px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              tab === key
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card hover:border-primary hover:bg-secondary",
            )}
          >
            {t(`tabs.${key}`)}
            <span className="ml-1.5 text-[12.5px] opacity-75">
              {format.number(groups[key].length)}
            </span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-card px-6 py-12 text-center">
          <TicketIcon className="mx-auto size-9 text-muted-foreground/60" />
          <p className="mt-3 text-[16px] font-semibold text-brand-deep">
            {t(`empty.${tab}`)}
          </p>
          {tab === "upcoming" && (
            <Link
              href="/#search"
              className="mt-3 inline-block font-semibold text-primary hover:underline"
            >
              {t("search")}
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {shown.map((booking) => {
            const refunded = booking.refunds.reduce(
              (sum, r) => sum + r.amount,
              0,
            );
            return (
              <li key={booking.id}>
                <Link
                  href={`/tickets/${booking.id}`}
                  className="block rounded-2xl border bg-card p-4 shadow-[0_10px_30px_-22px_rgba(6,56,43,.5)] outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[12px] uppercase tracking-[.08em] text-muted-foreground">
                        {t("trainNo", {
                          number: format.number(booking.train.number, {
                            useGrouping: false,
                          }),
                        })}
                        {" · "}
                        {booking.pnr}
                      </p>
                      <p className="text-[19px] font-extrabold text-brand-deep">
                        {locale === "bn"
                          ? booking.train.nameBn
                          : booking.train.nameEn}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <p className="mt-1 text-[16px]">
                    {stationName(booking.from, locale)}
                    <span className="mx-2 text-brand-red">→</span>
                    {stationName(booking.to, locale)}
                  </p>
                  <p className="text-[14px] text-muted-foreground">
                    {format.dateTime(dateStringToUtc(booking.date), {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                    {" · "}
                    {t("departs", {
                      time: formatTime(booking.departure, locale),
                    })}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <ul
                      className="flex flex-wrap gap-1.5"
                      aria-label={t("seats")}
                    >
                      {booking.seats.length > 0
                        ? booking.seats.map((seat) => (
                            <li
                              key={seat.id}
                              className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[12.5px] font-bold text-brand-deep"
                              title={tc(seat.seatClass)}
                            >
                              {seat.label}
                            </li>
                          ))
                        : booking.refunds
                            .flatMap((r) => r.seats)
                            .map((seat) => (
                              <li
                                key={seat.label}
                                className="rounded-md bg-muted px-2 py-0.5 font-mono text-[12.5px] font-bold text-muted-foreground line-through"
                              >
                                {seat.label}
                              </li>
                            ))}
                    </ul>
                    <p className="text-[14px]">
                      {booking.status === "cancelled" ? (
                        <>
                          <span className="text-muted-foreground">
                            {t("refunded", {
                              method: METHOD_STYLE[booking.paymentMethod].name,
                            })}{" "}
                          </span>
                          <b className="tabular-nums">{taka(refunded)}</b>
                        </>
                      ) : (
                        <>
                          <span className="text-muted-foreground">
                            {t("paid")}{" "}
                          </span>
                          <b className="tabular-nums">{taka(booking.total)}</b>
                        </>
                      )}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
