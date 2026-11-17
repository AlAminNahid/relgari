"use client";

import { useEffect, useState } from "react";
import { ClockIcon, LockIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { GatewayDialog } from "@/components/sections/checkout/gateway-dialog";
import { MethodPicker } from "@/components/sections/checkout/method-picker";
import { Button } from "@/components/ui/button";
import { METHOD_STYLE, type PaymentMethod } from "@/config/payment";
import { dateStringToUtc } from "@/lib/dates";
import { stationName } from "@/lib/stations";
import { cn } from "@/lib/utils";
import { startCheckout } from "@/services/bookings";
import type { Checkout as CheckoutData } from "@/types/api";

type Loaded =
  | { state: "loading" }
  | { state: "error" }
  | { state: "ready"; data: CheckoutData; deadline: number };

export function Checkout() {
  const t = useTranslations("checkout");
  const tc = useTranslations("classNames");
  const format = useFormatter();
  const locale = useLocale();
  const router = useRouter();

  const [loaded, setLoaded] = useState<Loaded>({ state: "loading" });
  const [method, setMethod] = useState<PaymentMethod>("bkash");
  const [gateOpen, setGateOpen] = useState(false);
  const [paid, setPaid] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    startCheckout()
      .then((data) => {
        if (!active) return;
        const seconds = Math.min(...data.holds.map((h) => h.secondsLeft));
        setLoaded({
          state: "ready",
          data,
          deadline:
            Date.now() + (Number.isFinite(seconds) ? seconds : 0) * 1000,
        });
      })
      .catch(() => {
        if (active) setLoaded({ state: "error" });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto max-w-[1000px] px-5 pb-20 pt-9">{children}</div>
  );
  const message = (title: string, body: string, action?: React.ReactNode) =>
    shell(
      <div className="mx-auto max-w-[560px] rounded-2xl border bg-card px-6 py-10 text-center">
        <h1 className="text-[22px] font-extrabold text-brand-deep">{title}</h1>
        <p className="mt-2 text-[15.5px] text-muted-foreground">{body}</p>
        {action}
      </div>,
    );
  const home = (
    <Link
      href="/#search"
      className="mt-5 inline-block font-semibold text-primary hover:underline"
    >
      {t("backToSeats")}
    </Link>
  );

  if (loaded.state === "loading") {
    return shell(
      <p className="py-24 text-center text-muted-foreground">{t("loading")}</p>,
    );
  }
  if (loaded.state === "error")
    return message(t("errorTitle"), t("errorBody"), home);
  const { data, deadline } = loaded;
  if (data.holds.length === 0) {
    return message(t("emptyTitle"), t("emptyBody"), home);
  }
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  if (remaining === 0 && !paid) {
    return message(t("expiredTitle"), t("expiredBody"), home);
  }

  const first = data.holds[0];
  const clock = `${format.number(Math.floor(remaining / 60))}:${format.number(remaining % 60, { minimumIntegerDigits: 2 })}`;
  const style = METHOD_STYLE[method];

  return shell(
    <>
      <h1 className="text-[clamp(26px,3.6vw,34px)] font-extrabold tracking-tight text-brand-deep">
        {t("title")}
      </h1>
      <p
        className={cn(
          "mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[14px] font-semibold",
          remaining <= 60
            ? "bg-brand-red-soft text-brand-red"
            : "bg-secondary text-brand-deep",
        )}
      >
        <ClockIcon className="size-4" />
        {t("timeLeft", { time: clock })}
      </p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section
          aria-label={t("orderTitle")}
          className="rounded-2xl border bg-card p-5 shadow-[0_10px_30px_-22px_rgba(6,56,43,.5)]"
        >
          <p className="font-mono text-[12px] uppercase tracking-[.08em] text-muted-foreground">
            {t("trainNo", {
              number: format.number(first.train.number, { useGrouping: false }),
            })}
          </p>
          <h2 className="text-[22px] font-extrabold text-brand-deep">
            {locale === "bn" ? first.train.nameBn : first.train.nameEn}
          </h2>
          <p className="mt-0.5 text-[16px]">
            {stationName(first.from, locale)}
            <span className="mx-2 text-brand-red">→</span>
            {stationName(first.to, locale)}
          </p>
          <p className="text-[14.5px] text-muted-foreground">
            {format.dateTime(dateStringToUtc(first.date), {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </p>

          <ul className="mt-4 divide-y rounded-xl border">
            {data.holds.map((hold) => (
              <li key={hold.id} className="flex items-center gap-3 px-3.5 py-3">
                <span className="grid h-9 min-w-12 place-items-center rounded-lg bg-primary px-1.5 font-mono text-[12.5px] font-bold text-primary-foreground">
                  {hold.label}
                </span>
                <span className="flex-1 text-[14.5px] text-brand-deep">
                  {tc(hold.seatClass)}
                </span>
                <b className="tabular-nums">৳{format.number(hold.fare)}</b>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1.5 text-[14.5px]">
            <Row label={t("fares")} value={data.subtotal} />
            <Row label={t("serviceCharge")} value={data.serviceCharge} />
            <div className="flex items-baseline justify-between border-t pt-2.5">
              <dt className="text-[15.5px] font-semibold">{t("total")}</dt>
              <dd className="text-[24px] font-extrabold tabular-nums text-brand-deep">
                ৳{format.number(data.total)}
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-label={t("payWith")}
          className="rounded-2xl border bg-card p-5 shadow-[0_10px_30px_-22px_rgba(6,56,43,.5)] lg:sticky lg:top-24"
        >
          <h2 className="text-[18px] font-bold text-brand-deep">
            {t("payWith")}
          </h2>
          <MethodPicker value={method} onChange={setMethod} />

          <div className="mt-5 border-t pt-4">
            <div className="flex items-baseline justify-between text-[14.5px]">
              <span className="text-muted-foreground">
                {t("paying", { method: style.name })}
              </span>
              <b className="text-[22px] font-extrabold tabular-nums text-brand-deep">
                ৳{format.number(data.total)}
              </b>
            </div>
            <Button
              onClick={() => setGateOpen(true)}
              disabled={paid}
              className="mt-3 h-12 w-full rounded-xl text-[16px] font-bold shadow-sm"
              style={{ background: style.bg, color: style.text }}
            >
              <LockIcon className="size-4" />
              {t("pay", { amount: format.number(data.total) })}
            </Button>
            <p className="mt-3 flex items-start gap-2 text-[13px] text-muted-foreground">
              <LockIcon className="mt-0.5 size-3.5 shrink-0" />
              {t("demoNote")}
            </p>
          </div>
        </section>
      </div>

      <GatewayDialog
        key={method}
        method={method}
        amount={data.total}
        open={gateOpen}
        onOpenChange={setGateOpen}
        onPaid={(id) => {
          setPaid(true);
          router.push(`/tickets/${id}`);
        }}
      />
    </>,
  );
}

function Row({ label, value }: { label: string; value: number }) {
  const format = useFormatter();
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">৳{format.number(value)}</dd>
    </div>
  );
}
