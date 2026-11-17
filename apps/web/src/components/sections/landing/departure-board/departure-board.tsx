"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionHead } from "@/components/sections/landing/section-head";
import { BOARD_STATIONS } from "@/config/site";
import { addDays, bdToday } from "@/lib/dates";
import { stationName } from "@/lib/stations";
import { cn } from "@/lib/utils";
import { getBoard } from "@/services/board";
import type { DepartureBoard as BoardData, Station } from "@/types/api";
import { formatTime } from "@/lib/clock";

const FEW_SEATS = 15;

export function DepartureBoard({
  initial,
  stations,
}: {
  initial: BoardData | null;
  stations: Station[];
}) {
  const t = useTranslations("departures");
  const tc = useTranslations("classNames");
  const format = useFormatter();
  const locale = useLocale();

  const [code, setCode] = useState<string>(
    initial?.station.code ?? BOARD_STATIONS[0],
  );
  const [board, setBoard] = useState<BoardData | null>(initial);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const nameOf = (c: string) => {
    const s =
      stations.find((x) => x.code === c) ??
      (board?.station.code === c ? board.station : undefined);
    return s ? stationName(s, locale) : c;
  };

  async function choose(next: string) {
    if (next === code) return;
    setCode(next);
    setLoading(true);
    setFailed(false);
    try {
      setBoard(await getBoard(next));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  const today = bdToday();
  const dayLabel = (date: string) =>
    date === today
      ? t("today")
      : date === addDays(today, 1)
        ? t("tomorrow")
        : format.dateTime(new Date(`${date}T00:00:00Z`), {
            day: "numeric",
            month: "short",
            timeZone: "UTC",
          });
  const clock = (time: string) => formatTime(time, locale);

  const head =
    "px-4 font-mono text-[11.5px] font-medium uppercase tracking-[.08em] text-[#6fa591]";
  const rows = board?.rows ?? [];

  return (
    <section id="routes" className="scroll-mt-20 py-[84px]">
      <div className="mx-auto max-w-[1140px] px-5">
        <SectionHead
          eyebrow={t("eyebrow")}
          title={t("title")}
          body={t("body")}
        />
        <div className="overflow-hidden rounded-2xl border border-[#14372b] bg-[#0b1f18] px-2 pb-3 pt-2 text-[#e8f4ee]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <span className="font-mono text-[12.5px] font-medium uppercase tracking-[.08em] text-[#7fb7a1]">
              {t("boardTitle", { station: nameOf(code) })}
            </span>
            <div
              role="tablist"
              aria-label={t("stations")}
              className="flex flex-wrap gap-1.5"
            >
              {BOARD_STATIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={c === code}
                  onClick={() => void choose(c)}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-[13.5px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#9fd8c0]",
                    c === code
                      ? "bg-[#ffcf5a] text-[#1d1d1d]"
                      : "bg-[#14372b] text-[#9fd8c0] hover:bg-[#1b4a39]",
                  )}
                >
                  {nameOf(c)}
                </button>
              ))}
            </div>
          </div>

          <div
            aria-busy={loading}
            className={cn("transition-opacity", loading && "opacity-50")}
          >
            {failed ? (
              <p className="px-4 py-10 text-center text-[#9fd8c0]">
                {t("error")}
              </p>
            ) : rows.length === 0 ? (
              <p className="px-4 py-10 text-center text-[#9fd8c0]">
                {t("empty")}
              </p>
            ) : (
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead className={head}>{t("headers.train")}</TableHead>
                    <TableHead className={head}>{t("headers.route")}</TableHead>
                    <TableHead className={head}>
                      {t("headers.departs")}
                    </TableHead>
                    <TableHead className={head}>
                      {t("headers.arrives")}
                    </TableHead>
                    <TableHead className={head}>
                      {t("headers.classes")}
                    </TableHead>
                    <TableHead className={head}>
                      <span className="sr-only">{t("book")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const open = r.classes.filter((c) => c.available > 0);
                    const total = open.reduce((sum, c) => sum + c.available, 0);
                    const first =
                      r.classes.find((c) => c.available > 0)?.seatClass ??
                      r.classes[0]?.seatClass;
                    const href = `/search?${new URLSearchParams({
                      from: code,
                      to: r.to.code,
                      date: r.date,
                      ...(first && first !== "shovan" ? { class: first } : {}),
                    })}`;
                    return (
                      <TableRow
                        key={`${r.number}-${r.date}`}
                        className="border-t border-[#16382c] hover:bg-transparent"
                      >
                        <TableCell className="px-4 py-[13px]">
                          <span className="block text-[17px] font-semibold text-white">
                            {locale === "bn" ? r.nameBn : r.nameEn}
                          </span>
                          <span className="font-mono text-[12px] text-[#7fb7a1]">
                            {format.number(r.number, { useGrouping: false })}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 text-[15.5px] font-medium">
                          {nameOf(code)}
                          <span className="mx-1.5 text-[#ffb3bc]">→</span>
                          {stationName(r.to, locale)}
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="block font-mono text-base font-medium">
                            {clock(r.departure)}
                          </span>
                          <span className="text-[12.5px] text-[#7fb7a1]">
                            {dayLabel(r.date)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 font-mono text-base font-medium">
                          {clock(r.arrival)}
                          {r.arrivalDayOffset > 0 && (
                            <span className="ml-1.5 rounded bg-[#14372b] px-1.5 py-px text-[11px] text-[#9fd8c0]">
                              {t("nextDay")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="flex flex-wrap gap-1">
                            {open.length > 0 && total <= FEW_SEATS && (
                              <Badge className="rounded-[5px] bg-brand-red text-white">
                                {t("few")}
                              </Badge>
                            )}
                            {open.length > 0 ? (
                              open.map((c) => (
                                <Badge
                                  key={c.seatClass}
                                  className="rounded-[5px] bg-[#14372b] text-[#9fd8c0]"
                                >
                                  {tc(c.seatClass)} ·{" "}
                                  {format.number(c.available)}
                                </Badge>
                              ))
                            ) : (
                              <Badge className="rounded-[5px] bg-[#3a2a14] text-[#ffcf5a]">
                                {t("soldOutNow")}
                              </Badge>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="px-4">
                          <Link
                            href={href}
                            className="text-sm font-semibold text-[#ffcf5a] hover:underline"
                          >
                            {t("book")}
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{t("note")}</p>
      </div>
    </section>
  );
}
