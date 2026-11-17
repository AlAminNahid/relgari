"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { CheckIcon, LockIcon, ShieldAlertIcon, XIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { MethodMark } from "@/components/sections/checkout/method-picker";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  METHOD_STYLE,
  TEST_VALUES,
  type PaymentMethod,
} from "@/config/payment";
import { cn } from "@/lib/utils";
import { ApiRequestError } from "@/services/http";
import { pay, type Payment } from "@/services/bookings";

type Step =
  | "number"
  | "otp"
  | "pin"
  | "card"
  | "processing"
  | "success"
  | "failed";

const EMPTY = {
  number: "",
  otp: "",
  pin: "",
  card: "",
  name: "",
  expiry: "",
  cvc: "",
};

const MIN_PROCESSING_MS = 2400;
const SUCCESS_MS = 1500;
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// "4242424242424242" to "4242 4242 4242 4242", and "1230" to "12/30", as the person types.
const groupCard = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
const formatExpiry = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
};

export function GatewayDialog({
  method,
  amount,
  open,
  onOpenChange,
  onPaid,
}: {
  method: PaymentMethod;
  amount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaid: (bookingId: string) => void;
}) {
  const t = useTranslations("gateway");
  const format = useFormatter();
  const style = METHOD_STYLE[method];
  const isCard = method === "card";
  const brand = method === "nagad" ? "#ec1c24" : style.bg;

  const startStep: Step = isCard ? "card" : "number";
  const [step, setStep] = useState<Step>(startStep);
  const [values, setValues] = useState(EMPTY);
  const [fieldError, setFieldError] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (step !== "processing") return;
    const id = setInterval(() => setStage((n) => Math.min(n + 1, 2)), 800);
    return () => {
      clearInterval(id);
      setStage(0);
    };
  }, [step]);

  const set = (key: keyof typeof EMPTY, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setFieldError(undefined);
  };
  const errorText = (code: string) =>
    t.has(`errors.${code}`) ? t(`errors.${code}`) : t("errors.INTERNAL");
  const total = format.number(amount);

  async function submit() {
    setStep("processing");
    const payment: Payment = isCard
      ? {
          method: "card",
          number: values.card,
          name: values.name,
          expiry: values.expiry,
          cvc: values.cvc,
        }
      : { method, number: values.number, otp: values.otp, pin: values.pin };
    try {
      const [booking] = await Promise.all([
        pay(payment),
        pause(MIN_PROCESSING_MS),
      ]);
      setStep("success");
      await pause(SUCCESS_MS);
      onPaid(booking.id);
    } catch (error) {
      await pause(500);
      const code = error instanceof ApiRequestError ? error.code : "INTERNAL";
      const backTo: Partial<Record<string, Step>> = {
        INVALID_WALLET_NUMBER: "number",
        INVALID_OTP: "otp",
        INVALID_PIN: "pin",
        INVALID_CARD: "card",
      };
      const target = backTo[code];
      if (target) {
        setFieldError(errorText(code));
        setStep(target);
      } else {
        setFailure(errorText(code));
        setStep("failed");
      }
    }
  }

  function next(e: React.FormEvent) {
    e.preventDefault();
    if (step === "number" && values.number.trim()) setStep("otp");
    else if (step === "otp" && values.otp.trim()) setStep("pin");
    else if (
      (step === "pin" && values.pin.trim()) ||
      (step === "card" && values.card.trim())
    ) {
      void submit();
    }
  }

  const busy = step === "processing" || step === "success";
  const walletStep =
    step === "number" ? 0 : step === "otp" ? 1 : step === "pin" ? 2 : -1;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return;
        onOpenChange(next);
      }}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) {
          setStep(startStep);
          setValues(EMPTY);
          setFieldError(undefined);
          setFailure(undefined);
        }
      }}
    >
      <DialogPortal>
        <DialogOverlay className="bg-brand-deep/55 supports-backdrop-filter:backdrop-blur-md" />
        <DialogPrimitive.Popup
          aria-describedby={undefined}
          style={{ "--gw": brand } as React.CSSProperties}
          className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-1.5rem)] w-[min(100%-1.5rem,420px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[22px] bg-white outline-none drop-shadow-[0_30px_50px_rgba(6,56,43,.4)] duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          <div className="h-1.5" style={{ background: brand }} />
          <header className="flex items-center gap-3 px-5 pb-3 pt-4">
            <MethodMark method={method} />
            <div className="min-w-0 flex-1 leading-tight">
              <DialogTitle className="text-[16px] font-bold">
                {t("title", { method: style.name })}
              </DialogTitle>
              <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-muted-foreground">
                <LockIcon className="size-3" />
                {t("secure")}
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[.08em] text-amber-800">
              {t("demo")}
            </span>
            {!busy && (
              <button
                type="button"
                aria-label={t("cancel")}
                onClick={() => onOpenChange(false)}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </header>

          <div className="mx-5 flex items-center justify-between rounded-xl bg-[#f6f8f6] px-4 py-3">
            <div className="leading-tight">
              <p className="text-[12px] text-muted-foreground">
                {t("merchantLabel")}
              </p>
              <p className="text-[15px] font-bold text-brand-deep">Relgari</p>
            </div>
            <div className="text-right leading-tight">
              <p className="text-[12px] text-muted-foreground">
                {t("amountLabel")}
              </p>
              <p
                className="text-[22px] font-extrabold tabular-nums"
                style={{ color: brand }}
              >
                ৳{total}
              </p>
            </div>
          </div>

          <div className="px-5 pb-5 pt-4">
            {walletStep >= 0 && <Steps current={walletStep} brand={brand} />}

            {step === "processing" && (
              <div className="flex flex-col items-center gap-4 py-9 text-center">
                <span
                  aria-hidden="true"
                  className="size-14 animate-spin rounded-full border-4 border-muted"
                  style={{ borderTopColor: brand }}
                />
                <p className="text-[16.5px] font-bold">
                  {t(`stages.${stage}`, {
                    method: isCard ? t("bank") : style.name,
                  })}
                </p>
                <p className="text-[13.5px] text-muted-foreground">
                  {t("processingNote")}
                </p>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center gap-3 py-9 text-center">
                <span
                  className="grid size-16 animate-in zoom-in-50 place-items-center rounded-full text-white duration-300"
                  style={{ background: brand }}
                >
                  <CheckIcon className="size-9" strokeWidth={3} />
                </span>
                <p className="text-[19px] font-extrabold">
                  {t("successTitle")}
                </p>
                <p className="text-[13.5px] text-muted-foreground">
                  {t("successNote")}
                </p>
              </div>
            )}

            {step === "failed" && (
              <div className="py-6 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-red-soft text-brand-red">
                  <ShieldAlertIcon className="size-8" />
                </span>
                <p className="mt-3 text-[19px] font-extrabold">
                  {t("failedTitle")}
                </p>
                <p className="mx-auto mt-1 max-w-[30ch] text-[14.5px] text-muted-foreground">
                  {failure}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFailure(undefined);
                    setValues(EMPTY);
                    setStep(startStep);
                  }}
                  className="mt-5 h-12 w-full rounded-xl text-[15.5px] font-bold text-white"
                  style={{ background: brand }}
                >
                  {t("tryAgain")}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="mt-2.5 text-[14px] font-medium text-muted-foreground hover:text-foreground"
                >
                  {t("cancel")}
                </button>
              </div>
            )}

            {(step === "number" ||
              step === "otp" ||
              step === "pin" ||
              step === "card") && (
              <form
                onSubmit={next}
                className="flex flex-col gap-3.5"
                noValidate
              >
                {step === "number" && (
                  <Field
                    id="gw-number"
                    title={t("numberTitle", { method: style.name })}
                    label={t("numberLabel")}
                    hint={t("hintNumber", { value: TEST_VALUES.number })}
                    fill={() => set("number", TEST_VALUES.number)}
                    fillLabel={t("fill")}
                    error={fieldError}
                  >
                    <GwInput
                      id="gw-number"
                      type="tel"
                      inputMode="numeric"
                      autoFocus
                      placeholder="01XXXXXXXXX"
                      value={values.number}
                      onChange={(e) => set("number", e.target.value)}
                    />
                  </Field>
                )}
                {step === "otp" && (
                  <Field
                    id="gw-otp"
                    title={t("otpTitle", { number: values.number })}
                    label={t("otpLabel")}
                    hint={t("hintOtp", { value: TEST_VALUES.otp })}
                    fill={() => set("otp", TEST_VALUES.otp)}
                    fillLabel={t("fill")}
                    error={fieldError}
                  >
                    <GwInput
                      id="gw-otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      maxLength={6}
                      center
                      value={values.otp}
                      onChange={(e) => set("otp", e.target.value)}
                    />
                  </Field>
                )}
                {step === "pin" && (
                  <Field
                    id="gw-pin"
                    title={t("pinTitle", { method: style.name })}
                    label={t("pinLabel")}
                    hint={`${t("hintPin", { value: TEST_VALUES.pin })} ${t("hintPinFail")}`}
                    fill={() => set("pin", TEST_VALUES.pin)}
                    fillLabel={t("fill")}
                    error={fieldError}
                  >
                    <GwInput
                      id="gw-pin"
                      type="password"
                      inputMode="numeric"
                      autoFocus
                      maxLength={6}
                      center
                      value={values.pin}
                      onChange={(e) => set("pin", e.target.value)}
                    />
                  </Field>
                )}
                {step === "card" && (
                  <>
                    <CardPreview
                      number={values.card}
                      name={values.name}
                      expiry={values.expiry}
                      brand={brand}
                    />
                    <Field
                      id="gw-card"
                      title=""
                      label={t("cardNumber")}
                      hint={`${t("hintCard", { value: TEST_VALUES.card, expiry: TEST_VALUES.cardExpiry, cvc: TEST_VALUES.cardCvc })} ${t("hintCardFail")}`}
                      fill={() => {
                        setValues((v) => ({
                          ...v,
                          card: TEST_VALUES.card,
                          name: v.name || "Relgari Demo",
                          expiry: TEST_VALUES.cardExpiry,
                          cvc: TEST_VALUES.cardCvc,
                        }));
                        setFieldError(undefined);
                      }}
                      fillLabel={t("fill")}
                      error={fieldError}
                    >
                      <GwInput
                        id="gw-card"
                        inputMode="numeric"
                        autoFocus
                        placeholder="0000 0000 0000 0000"
                        value={values.card}
                        onChange={(e) => set("card", groupCard(e.target.value))}
                      />
                    </Field>
                    <div>
                      <Label htmlFor="gw-name">{t("cardName")}</Label>
                      <GwInput
                        id="gw-name"
                        value={values.name}
                        onChange={(e) => set("name", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="gw-expiry">{t("cardExpiry")}</Label>
                        <GwInput
                          id="gw-expiry"
                          inputMode="numeric"
                          placeholder="MM/YY"
                          value={values.expiry}
                          onChange={(e) =>
                            set("expiry", formatExpiry(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="gw-cvc">{t("cardCvc")}</Label>
                        <GwInput
                          id="gw-cvc"
                          type="password"
                          inputMode="numeric"
                          maxLength={3}
                          value={values.cvc}
                          onChange={(e) => set("cvc", e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15.5px] font-bold text-white shadow-sm transition-[filter] hover:brightness-95"
                  style={{ background: brand }}
                >
                  {(step === "pin" || step === "card") && (
                    <LockIcon className="size-4" />
                  )}
                  {step === "pin" || step === "card"
                    ? t("pay", { amount: total })
                    : t("next")}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="text-[14px] font-medium text-muted-foreground hover:text-foreground"
                >
                  {t("cancel")}
                </button>
              </form>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}

function Steps({ current, brand }: { current: number; brand: string }) {
  const t = useTranslations("gateway");
  const labels = [t("stepAccount"), t("stepCode"), t("stepPin")];
  return (
    <ol className="mb-4 flex items-center" aria-label={t("steps")}>
      {labels.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <span className="flex items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "grid size-6 place-items-center rounded-full border-2 text-[11.5px] font-bold",
                  !done && !active && "border-border text-muted-foreground",
                )}
                style={
                  done || active
                    ? {
                        borderColor: brand,
                        background: done ? brand : "transparent",
                        color: done ? "#fff" : brand,
                      }
                    : undefined
                }
              >
                {done ? (
                  <CheckIcon className="size-3.5" strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  "text-[12.5px] font-semibold",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </span>
            {i < labels.length - 1 && (
              <span
                aria-hidden="true"
                className="mx-2 h-0.5 flex-1 rounded"
                style={{ background: done ? brand : "var(--border)" }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function CardPreview({
  number,
  name,
  expiry,
  brand,
}: {
  number: string;
  name: string;
  expiry: string;
  brand: string;
}) {
  const t = useTranslations("gateway");
  const digits = number.replace(/\D/g, "").slice(0, 16);
  const shown = (digits + "•".repeat(16 - digits.length))
    .replace(/(.{4})/g, "$1 ")
    .trim();
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden rounded-2xl p-4 text-white shadow-md"
      style={{ background: `linear-gradient(135deg, ${brand}, #0d5b45 70%)` }}
    >
      <span className="absolute -right-8 -top-10 size-36 rounded-full bg-white/10" />
      <div className="flex items-center justify-between">
        <span className="h-7 w-9 rounded-md bg-[#e6c15c]/90" />
        <span className="font-mono text-[11px] font-bold tracking-[.12em]">
          VISA · MC
        </span>
      </div>
      <p className="mt-4 font-mono text-[18px] font-semibold tracking-[.08em]">
        {shown}
      </p>
      <div className="mt-3 flex items-end justify-between text-[12px]">
        <span className="max-w-[60%] truncate uppercase tracking-wide">
          {name || t("cardName")}
        </span>
        <span className="font-mono">{expiry || "MM/YY"}</span>
      </div>
    </div>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-[.08em] text-muted-foreground"
    >
      {children}
    </label>
  );
}

function GwInput({
  center,
  className,
  ...props
}: React.ComponentProps<"input"> & { center?: boolean }) {
  return (
    <input
      autoComplete="off"
      {...props}
      className={cn(
        "h-12 w-full rounded-xl border-[1.5px] border-border bg-white px-3.5 text-[16px] outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus:border-[var(--gw)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--gw)_22%,transparent)]",
        center && "text-center font-mono text-[22px] tracking-[.35em]",
        className,
      )}
    />
  );
}

function Field({
  id,
  title,
  label,
  hint,
  fill,
  fillLabel,
  error,
  children,
}: {
  id: string;
  title: string;
  label: string;
  hint: string;
  fill: () => void;
  fillLabel: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {title && <p className="mb-3 text-[16px] font-bold">{title}</p>}
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-[13.5px] font-medium text-destructive"
        >
          <ShieldAlertIcon className="size-4 shrink-0" />
          {error}
        </p>
      ) : (
        <p className="mt-2 flex items-start justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900">
          <span>{hint}</span>
          <button
            type="button"
            onClick={fill}
            className="shrink-0 font-bold underline underline-offset-2"
          >
            {fillLabel}
          </button>
        </p>
      )}
    </div>
  );
}
