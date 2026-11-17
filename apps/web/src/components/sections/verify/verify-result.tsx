import { BanIcon, CheckCircle2Icon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { dateStringToUtc } from "@/lib/dates";
import { stationName } from "@/lib/stations";
import { cn } from "@/lib/utils";
import type { TicketCheck } from "@/types/api";
import { formatTime } from "@/lib/clock";

export function VerifyResult({ ticket }: { ticket: TicketCheck }) {
  const t = useTranslations("verify");
  const tc = useTranslations("classNames");
  const locale = useLocale();
  const format = useFormatter();

  const banner = {
    confirmed: { Icon: CheckCircle2Icon, tone: "bg-emerald-600 text-white" },
    partly_cancelled: {
      Icon: CheckCircle2Icon,
      tone: "bg-emerald-600 text-white",
    },
    cancelled: { Icon: BanIcon, tone: "bg-brand-red text-white" },
    departed: { Icon: ClockIcon, tone: "bg-muted-foreground text-white" },
  }[ticket.status];

  const time = formatTime(ticket.departure, locale);

  return (
    <div className="mx-auto max-w-[520px] px-5 pb-20 pt-9">
      <article className="overflow-hidden rounded-[22px] bg-card shadow-[0_26px_50px_-28px_rgba(6,56,43,.6)] ring-1 ring-foreground/10">
        <div className={cn("flex items-center gap-3 px-6 py-5", banner.tone)}>
          <banner.Icon className="size-9 shrink-0" />
          <div>
            <h1 className="text-[22px] font-extrabold leading-tight">
              {t(`status.${ticket.status}`)}
            </h1>
            <p className="text-[14px] opacity-90">
              {t(`note.${ticket.status}`)}
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="font-mono text-[12px] uppercase tracking-[.08em] text-muted-foreground">
            {t("trainNo", {
              number: format.number(ticket.train.number, {
                useGrouping: false,
              }),
            })}
          </p>
          <p className="text-[22px] font-extrabold text-brand-deep">
            {locale === "bn" ? ticket.train.nameBn : ticket.train.nameEn}
          </p>
          <p className="mt-0.5 text-[17px]">
            {stationName(ticket.from, locale)}
            <span className="mx-2 text-brand-red">→</span>
            {stationName(ticket.to, locale)}
          </p>
          <p className="text-[14.5px] text-muted-foreground">
            {format.dateTime(dateStringToUtc(ticket.date), {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            })}
            {" · "}
            {t("departs", { time })}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-background px-3.5 py-2.5">
              <dt className="font-mono text-[10.5px] uppercase tracking-[.08em] text-muted-foreground">
                {t("pnr")}
              </dt>
              <dd className="mt-0.5 font-mono font-bold tracking-[.08em] text-brand-deep">
                {ticket.pnr}
              </dd>
            </div>
            <div className="rounded-xl bg-background px-3.5 py-2.5">
              <dt className="font-mono text-[10.5px] uppercase tracking-[.08em] text-muted-foreground">
                {t("passenger")}
              </dt>
              <dd className="mt-0.5 font-bold text-brand-deep">
                {ticket.passenger}
              </dd>
            </div>
          </dl>

          {ticket.seats.length > 0 && (
            <>
              <h2 className="mb-2 mt-5 font-mono text-[11.5px] font-medium uppercase tracking-[.08em] text-muted-foreground">
                {t("seats")}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {ticket.seats.map((seat) => (
                  <li
                    key={seat.label}
                    className="rounded-lg bg-secondary px-3 py-1.5 text-[13.5px]"
                  >
                    <b className="font-mono text-brand-deep">{seat.label}</b>
                    <span className="ml-1.5 text-muted-foreground">
                      {tc(seat.seatClass)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </article>

      <p className="mt-5 text-center text-[13px] text-muted-foreground">
        {t("demoNote")}
      </p>
      <p className="mt-3 text-center">
        <Link
          href="/verify"
          className="font-semibold text-primary hover:underline"
        >
          {t("another")}
        </Link>
      </p>
    </div>
  );
}
