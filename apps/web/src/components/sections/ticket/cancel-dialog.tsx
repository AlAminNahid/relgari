"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { CANCEL_CLOSES_HOURS, CANCEL_TIERS } from "@/config/cancellation";
import { METHOD_STYLE } from "@/config/payment";
import { cn } from "@/lib/utils";
import { cancelQuote, cancelSeats } from "@/services/bookings";
import { ApiRequestError } from "@/services/http";
import type { Booking, CancelQuote, Refund } from "@/types/api";

export function CancelDialog({ booking }: { booking: Booking }) {
  const t = useTranslations("cancel");
  const tc = useTranslations("classNames");
  const format = useFormatter();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [quote, setQuote] = useState<{ key: string; data: CancelQuote }>();
  const [error, setError] = useState<string>();
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState<Refund>();

  const key = picked.slice().sort().join(",");
  const method = METHOD_STYLE[booking.paymentMethod].name;
  const taka = (value: number) => `৳${format.number(value)}`;

  const errorText = useCallback(
    (e: unknown) => {
      const code = e instanceof ApiRequestError ? e.code : "INTERNAL";
      const seconds = e instanceof ApiRequestError ? (e.retryAfter ?? 30) : 30;
      return t.has(`errors.${code}`)
        ? t(`errors.${code}`, { seconds })
        : t("errors.INTERNAL");
    },
    [t],
  );

  useEffect(() => {
    if (!open || picked.length === 0) return;
    let active = true;
    cancelQuote(booking.id, picked)
      .then((data) => {
        if (active) setQuote({ key, data });
      })
      .catch((e: unknown) => {
        if (active) setError(errorText(e));
      });
    return () => {
      active = false;
    };
  }, [open, key, picked, booking.id, errorText]);

  const ready =
    quote && quote.key === key && picked.length > 0 ? quote.data : null;

  async function confirm() {
    setWorking(true);
    setError(undefined);
    try {
      setDone(await cancelSeats(booking.id, picked));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setWorking(false);
    }
  }

  function close() {
    const finished = Boolean(done);
    setOpen(false);
    if (finished) router.refresh();
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-11 rounded-xl border-brand-red/40 px-5 font-semibold text-brand-red hover:bg-brand-red-soft hover:text-brand-red"
      >
        {t("button")}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
          else setOpen(true);
        }}
        onOpenChangeComplete={(isOpen) => {
          if (!isOpen) {
            setPicked([]);
            setQuote(undefined);
            setError(undefined);
            setDone(undefined);
          }
        }}
      >
        <DialogPortal>
          <DialogOverlay className="bg-brand-deep/50 supports-backdrop-filter:backdrop-blur-md" />
          <DialogPrimitive.Popup
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-1.5rem)] w-[min(100%-1.5rem,460px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[22px] bg-white p-5 outline-none drop-shadow-[0_30px_50px_rgba(6,56,43,.4)] duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:p-6"
          >
            {done ? (
              <div className="py-4 text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-white">
                  <CheckIcon className="size-9" strokeWidth={3} />
                </span>
                <DialogTitle className="mt-4 text-[20px] font-extrabold">
                  {t("doneTitle")}
                </DialogTitle>
                <p className="mt-1 text-[15px] text-muted-foreground">
                  {t("doneBody", { amount: taka(done.amount), method })}
                </p>
                <p className="mt-3 rounded-xl bg-background px-4 py-3 text-[14px]">
                  {t("reference")}{" "}
                  <b className="font-mono tracking-[.06em]">{done.reference}</b>
                </p>
                <Button
                  onClick={close}
                  className="mt-5 h-12 w-full rounded-xl text-[15.5px] font-bold"
                >
                  {t("done")}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <DialogTitle className="text-[20px] font-extrabold leading-tight">
                    {t("title")}
                  </DialogTitle>
                  <button
                    type="button"
                    aria-label={t("close")}
                    onClick={close}
                    className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
                <p className="mt-1 text-[14px] text-muted-foreground">
                  {t("intro")}
                </p>

                <ul className="mt-4 space-y-2" aria-label={t("seats")}>
                  {booking.seats.map((seat) => {
                    const on = picked.includes(seat.id);
                    return (
                      <li key={seat.id}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-2.5 transition-colors",
                            on
                              ? "border-brand-red bg-brand-red-soft/50"
                              : "bg-background hover:border-foreground/30",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => {
                              setError(undefined);
                              setPicked((list) =>
                                on
                                  ? list.filter((id) => id !== seat.id)
                                  : [...list, seat.id],
                              );
                            }}
                            className="size-4 accent-[var(--brand-red)]"
                          />
                          <span className="font-mono text-[13.5px] font-bold text-brand-deep">
                            {seat.label}
                          </span>
                          <span className="flex-1 text-[14px] text-muted-foreground">
                            {tc(seat.seatClass)}
                          </span>
                          <b className="tabular-nums">{taka(seat.fare)}</b>
                        </label>
                      </li>
                    );
                  })}
                </ul>

                {ready ? (
                  <dl className="mt-4 space-y-1.5 rounded-xl bg-background px-4 py-3 text-[14.5px]">
                    <Line label={t("fares")} value={taka(ready.fareTotal)} />
                    <Line
                      label={t("fee", {
                        percent: format.number(ready.feePercent),
                      })}
                      value={`−${taka(ready.fee)}`}
                    />
                    <div className="flex items-baseline justify-between border-t pt-2">
                      <dt className="font-semibold">
                        {t("refundTo", { method })}
                      </dt>
                      <dd className="text-[22px] font-extrabold tabular-nums text-brand-deep">
                        {taka(ready.amount)}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-4 rounded-xl bg-background px-4 py-3 text-[14px] text-muted-foreground">
                    {picked.length === 0 ? t("pickSome") : t("calculating")}
                  </p>
                )}
                <p className="mt-2 text-[12.5px] text-muted-foreground">
                  {t("serviceNote")}
                </p>

                <details className="mt-3 text-[13px] text-muted-foreground">
                  <summary className="cursor-pointer font-semibold text-brand-deep">
                    {t("policy")}
                  </summary>
                  <ul className="mt-2 space-y-1">
                    {CANCEL_TIERS.map((tier, i) => (
                      <li
                        key={tier.hoursBefore}
                        className="flex justify-between"
                      >
                        <span>
                          {i === 0
                            ? t("policyOver", {
                                hours: format.number(tier.hoursBefore),
                              })
                            : t("policyBetween", {
                                from: format.number(tier.hoursBefore),
                                to: format.number(
                                  CANCEL_TIERS[i - 1].hoursBefore,
                                ),
                              })}
                        </span>
                        <b>{format.number(tier.feePercent)}%</b>
                      </li>
                    ))}
                    <li className="flex justify-between">
                      <span>
                        {t("policyUnder", {
                          hours: format.number(CANCEL_CLOSES_HOURS),
                        })}
                      </span>
                      <b>{t("notAllowed")}</b>
                    </li>
                  </ul>
                </details>

                {error && (
                  <p
                    role="alert"
                    className="mt-3 rounded-xl bg-brand-red-soft px-4 py-2.5 text-[14px] font-medium text-brand-red"
                  >
                    {error}
                  </p>
                )}

                <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
                  <Button
                    onClick={() => void confirm()}
                    disabled={!ready || working}
                    className="h-12 flex-1 rounded-xl bg-brand-red text-[15.5px] font-bold text-white hover:bg-brand-red/90"
                  >
                    {working
                      ? t("working")
                      : t("confirm", { count: picked.length })}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={close}
                    className="h-12 rounded-xl px-6 text-[15px] font-semibold"
                  >
                    {t("keep")}
                  </Button>
                </div>
              </>
            )}
          </DialogPrimitive.Popup>
        </DialogPortal>
      </Dialog>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
