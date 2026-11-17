import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { METHOD_STYLE } from "@/config/payment";
import { dateStringToUtc } from "@/lib/dates";
import { stationName } from "@/lib/stations";
import type { Booking } from "@/types/api";

// The e-ticket of a paid booking. The QR code is made on the server and passed in as an SVG string.
export function TicketView({
  booking,
  qrSvg,
}: {
  booking: Booking;
  qrSvg: string;
}) {
  const t = useTranslations("ticketPage");
  const tc = useTranslations("classNames");
  const locale = useLocale();
  const format = useFormatter();

  const clock = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return format.dateTime(new Date(Date.UTC(2000, 0, 1, hours, minutes)), {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "UTC",
    });
  };
  const method = METHOD_STYLE[booking.paymentMethod];
  const taka = (value: number) => `৳${format.number(value)}`;

  return (
    <div className="mx-auto max-w-[760px] px-5 pb-20 pt-9">
      <h1 className="sr-only">{t("title")}</h1>

      <article className="overflow-hidden rounded-[22px] bg-card shadow-[0_26px_50px_-28px_rgba(6,56,43,.6)] ring-1 ring-foreground/10">
        <header className="flex flex-wrap items-center justify-between gap-3 bg-[linear-gradient(135deg,var(--primary),var(--brand-deep)_75%)] px-6 py-5 text-white">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[.1em] text-[#bcd6cc]">
              {t("trainNo", {
                number: format.number(booking.train.number, {
                  useGrouping: false,
                }),
              })}
            </p>
            <p className="text-[22px] font-extrabold tracking-tight">
              {locale === "bn" ? booking.train.nameBn : booking.train.nameEn}
            </p>
          </div>
          <span className="rounded-full bg-white/15 px-3.5 py-1 font-mono text-[12px] font-semibold tracking-[.1em]">
            {t("confirmed")}
          </span>
        </header>

        <div className="px-6 pb-6 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[clamp(22px,4vw,30px)] font-extrabold leading-tight text-brand-deep">
                {stationName(booking.from, locale)}
              </p>
              <p className="mt-0.5 text-[14.5px] text-muted-foreground">
                {t("departs")} {clock(booking.departure)}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="mt-3 flex-1 border-t-2 border-dashed border-brand-deep/30"
            />
            <div className="text-right">
              <p className="text-[clamp(22px,4vw,30px)] font-extrabold leading-tight text-brand-deep">
                {stationName(booking.to, locale)}
              </p>
              <p className="mt-0.5 text-[14.5px] text-muted-foreground">
                {t("arrives")} {clock(booking.arrival)}
                {booking.arrivalDayOffset > 0 && ` · ${t("nextDay")}`}
              </p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Info label={t("journeyDate")}>
              {format.dateTime(dateStringToUtc(booking.date), {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              })}
            </Info>
            <Info label={t("passenger")}>{booking.passenger.name}</Info>
            <Info label={t("pnr")}>
              <span className="font-mono tracking-[.08em]">{booking.pnr}</span>
            </Info>
          </dl>

          <h2 className="mb-2 mt-6 font-mono text-[11.5px] font-medium uppercase tracking-[.08em] text-muted-foreground">
            {t("seats")}
          </h2>
          <table className="w-full text-left text-[14.5px]">
            <thead className="text-[12.5px] text-muted-foreground">
              <tr className="border-b">
                <th className="py-1.5 font-medium">{t("seat")}</th>
                <th className="py-1.5 font-medium">{t("coach")}</th>
                <th className="py-1.5 font-medium">{t("class")}</th>
                <th className="py-1.5 text-right font-medium">{t("fare")}</th>
              </tr>
            </thead>
            <tbody>
              {booking.seats.map((seat) => (
                <tr key={seat.id} className="border-b last:border-0">
                  <td className="py-2 font-mono font-bold text-brand-deep">
                    {seat.label}
                  </td>
                  <td className="py-2">{seat.coach}</td>
                  <td className="py-2">{tc(seat.seatClass)}</td>
                  <td className="py-2 text-right tabular-nums">
                    {taka(seat.fare)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="relative border-t-2 border-dashed px-6 py-5">
          <span
            aria-hidden="true"
            className="absolute -left-3 -top-3 size-6 rounded-full bg-background"
          />
          <span
            aria-hidden="true"
            className="absolute -right-3 -top-3 size-6 rounded-full bg-background"
          />
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div
              role="img"
              aria-label={`${t("gate")}: ${booking.pnr}`}
              className="size-40 shrink-0 rounded-xl border bg-white p-2 [&_svg]:size-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <div className="w-full text-[14.5px]">
              <p className="text-[17px] font-bold text-brand-deep">
                {t("gate")}
              </p>
              <p className="mt-0.5 text-muted-foreground">{t("gateNote")}</p>
              <dl className="mt-3 space-y-1">
                <Line label={t("fares")} value={taka(booking.subtotal)} />
                <Line
                  label={t("serviceCharge")}
                  value={taka(booking.serviceCharge)}
                />
                <Line label={t("total")} value={taka(booking.total)} strong />
              </dl>
              <p className="mt-3 text-[13px] text-muted-foreground">
                <span
                  className="mr-1.5 inline-block rounded px-1.5 py-px text-[11.5px] font-bold"
                  style={{ background: method.bg, color: method.text }}
                >
                  {method.name}
                </span>
                {t("transaction")}{" "}
                <span className="font-mono">{booking.transactionId}</span>
                {" · "}
                {format.dateTime(new Date(booking.paidAt), {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  hourCycle: "h23",
                  timeZone: "Asia/Dhaka",
                })}
              </p>
            </div>
          </div>
        </div>
      </article>

      <p className="mt-6 text-center">
        <Link href="/" className="font-semibold text-primary hover:underline">
          {t("home")}
        </Link>
      </p>
    </div>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-background px-3.5 py-2.5">
      <dt className="font-mono text-[10.5px] uppercase tracking-[.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-[15.5px] font-bold text-brand-deep">
        {children}
      </dd>
    </div>
  );
}

function Line({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className={strong ? "font-semibold" : "text-muted-foreground"}>
        {label}
      </dt>
      <dd
        className={
          strong
            ? "text-[18px] font-extrabold tabular-nums text-brand-deep"
            : "tabular-nums"
        }
      >
        {value}
      </dd>
    </div>
  );
}
