"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Loader2Icon, ShieldAlertIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  METHOD_STYLE,
  TEST_VALUES,
  type PaymentMethod,
} from "@/config/payment";
import { ApiRequestError } from "@/services/http";
import { pay, type Payment } from "@/services/bookings";

type Step = "number" | "otp" | "pin" | "card" | "processing" | "failed";

const EMPTY = {
  number: "",
  otp: "",
  pin: "",
  card: "",
  name: "",
  expiry: "",
  cvc: "",
};

const MIN_PROCESSING_MS = 1600;
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// A pretend payment screen in the style of the method chosen. Everything the person types is sent
// to the API, which says yes or no by fixed rules. No money moves.
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

  const [step, setStep] = useState<Step>(isCard ? "card" : "number");
  const [values, setValues] = useState(EMPTY);
  const [fieldError, setFieldError] = useState<string>();
  const [failure, setFailure] = useState<string>();

  const startStep: Step = isCard ? "card" : "number";
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
      onPaid(booking.id);
    } catch (error) {
      await pause(400);
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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // The window cannot be closed while the payment is being processed.
        if (!next && step === "processing") return;
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
        <DialogOverlay className="bg-brand-deep/50 supports-backdrop-filter:backdrop-blur-md" />
        <DialogPrimitive.Popup
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,400px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white outline-none drop-shadow-[0_24px_36px_rgba(6,56,43,.35)] duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ background: style.bg, color: style.text }}
          >
            <DialogTitle className="text-[22px] font-extrabold tracking-tight">
              {style.name}
            </DialogTitle>
            <span className="rounded-full bg-black/20 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[.08em]">
              {t("demo")}
            </span>
          </div>

          <div className="px-5 pb-5 pt-4">
            <p className="rounded-lg bg-secondary px-3 py-2 text-[13px] text-brand-deep">
              {t("banner")}
            </p>
            <p className="mt-3 flex items-baseline justify-between text-[14.5px] text-muted-foreground">
              <span>{t("merchant")}</span>
              <b className="text-[20px] font-extrabold tabular-nums text-foreground">
                ৳{total}
              </b>
            </p>

            {step === "processing" && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Loader2Icon
                  className="size-9 animate-spin"
                  style={{ color: style.bg }}
                />
                <p className="text-[16px] font-semibold">{t("processing")}</p>
                <p className="text-[13.5px] text-muted-foreground">
                  {t("processingNote")}
                </p>
              </div>
            )}

            {step === "failed" && (
              <div className="py-6 text-center">
                <ShieldAlertIcon className="mx-auto size-10 text-brand-red" />
                <p className="mt-2 text-[18px] font-bold">{t("failedTitle")}</p>
                <p className="mt-1 text-[14.5px] text-muted-foreground">
                  {failure}
                </p>
                <Button
                  onClick={() => {
                    setFailure(undefined);
                    setValues(EMPTY);
                    setStep(startStep);
                  }}
                  className="mt-4 h-11 w-full rounded-xl text-[15px] font-bold"
                >
                  {t("tryAgain")}
                </Button>
              </div>
            )}

            {(step === "number" ||
              step === "otp" ||
              step === "pin" ||
              step === "card") && (
              <form
                onSubmit={next}
                className="mt-4 flex flex-col gap-3.5"
                noValidate
              >
                {step === "number" && (
                  <Field
                    id="gw-number"
                    title={t("numberTitle", { method: style.name })}
                    label={t("numberLabel")}
                    hint={t("hintNumber", { value: TEST_VALUES.number })}
                    error={fieldError}
                  >
                    <Input
                      id="gw-number"
                      type="tel"
                      inputMode="numeric"
                      autoFocus
                      autoComplete="off"
                      placeholder="01XXXXXXXXX"
                      value={values.number}
                      onChange={(e) => set("number", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                )}
                {step === "otp" && (
                  <Field
                    id="gw-otp"
                    title={t("otpTitle", { number: values.number })}
                    label={t("otpLabel")}
                    hint={t("hintOtp", { value: TEST_VALUES.otp })}
                    error={fieldError}
                  >
                    <Input
                      id="gw-otp"
                      inputMode="numeric"
                      autoFocus
                      autoComplete="one-time-code"
                      value={values.otp}
                      onChange={(e) => set("otp", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                )}
                {step === "pin" && (
                  <Field
                    id="gw-pin"
                    title={t("pinTitle", { method: style.name })}
                    label={t("pinLabel")}
                    hint={`${t("hintPin", { value: TEST_VALUES.pin })} ${t("hintPinFail")}`}
                    error={fieldError}
                  >
                    <Input
                      id="gw-pin"
                      type="password"
                      inputMode="numeric"
                      autoFocus
                      autoComplete="off"
                      value={values.pin}
                      onChange={(e) => set("pin", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                )}
                {step === "card" && (
                  <>
                    <Field
                      id="gw-card"
                      title={t("cardTitle")}
                      label={t("cardNumber")}
                      hint={`${t("hintCard", { value: TEST_VALUES.card, expiry: TEST_VALUES.cardExpiry, cvc: TEST_VALUES.cardCvc })} ${t("hintCardFail")}`}
                      error={fieldError}
                    >
                      <Input
                        id="gw-card"
                        inputMode="numeric"
                        autoFocus
                        autoComplete="off"
                        placeholder="0000 0000 0000 0000"
                        value={values.card}
                        onChange={(e) => set("card", e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <div>
                      <Label htmlFor="gw-name" className={labelClass}>
                        {t("cardName")}
                      </Label>
                      <Input
                        id="gw-name"
                        autoComplete="off"
                        value={values.name}
                        onChange={(e) => set("name", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="gw-expiry" className={labelClass}>
                          {t("cardExpiry")}
                        </Label>
                        <Input
                          id="gw-expiry"
                          autoComplete="off"
                          placeholder="MM/YY"
                          value={values.expiry}
                          onChange={(e) => set("expiry", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gw-cvc" className={labelClass}>
                          {t("cardCvc")}
                        </Label>
                        <Input
                          id="gw-cvc"
                          inputMode="numeric"
                          autoComplete="off"
                          value={values.cvc}
                          onChange={(e) => set("cvc", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </>
                )}
                <Button
                  type="submit"
                  className="mt-1 h-11 rounded-xl text-[15px] font-bold"
                  style={{ background: style.bg, color: style.text }}
                >
                  {step === "pin" || step === "card"
                    ? t("pay", { amount: total })
                    : t("next")}
                </Button>
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

const inputClass = "h-11 rounded-[10px] bg-background px-3 text-[15.5px]";
const labelClass =
  "mb-[5px] block font-mono text-[11px] font-medium uppercase tracking-[.08em] text-muted-foreground";

function Field({
  id,
  title,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  title: string;
  label: string;
  hint: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2.5 text-[16px] font-bold">{title}</p>
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-[13.5px] text-destructive">
          {error}
        </p>
      ) : (
        <p className="mt-1.5 text-[13px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
