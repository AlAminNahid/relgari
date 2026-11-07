"use client";

import { useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toFailure } from "@/components/sections/auth/auth-failure";
import { AuthField } from "@/components/sections/auth/auth-field";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { getFieldErrors, loginSchema } from "@/lib/validations";
import { login } from "@/services/auth";

const inputClass = "h-11 rounded-[10px] bg-background px-3 text-[15.5px]";
const FIELDS = ["phone", "password"] as const;
type Field = (typeof FIELDS)[number];

export function LoginForm({
  onSwitch,
  onSuccess,
}: {
  onSwitch: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("auth");
  const [values, setValues] = useState<Record<Field, string>>({
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState(false);

  const change = (field: Field, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormError(undefined);
  };

  const showFailure = (fields: Record<string, string>, form?: string) => {
    setErrors(fields);
    setFormError(form);
    const first = FIELDS.find((f) => fields[f]);
    if (first) document.getElementById(`login-${first}`)?.focus();
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const found = getFieldErrors(result.error);
      return showFailure(
        Object.fromEntries(
          Object.entries(found).map(([f, k]) => [f, `errors.${k}`]),
        ),
      );
    }

    setPending(true);
    setErrors({});
    setFormError(undefined);
    try {
      await login(result.data);
      onSuccess();
    } catch (error) {
      const failure = toFailure(error);
      showFailure(failure.fields, failure.form);
      setPending(false);
    }
  }

  const err = (f: Field) => (errors[f] ? t(errors[f]) : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3.5">
      <DialogTitle className="mb-1.5 text-2xl font-extrabold tracking-tight text-brand-deep">
        {t("loginTitle")}
      </DialogTitle>

      <AuthField id="login-phone" label={t("phone")} error={err("phone")}>
        <Input
          id="login-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={14}
          placeholder={t("phonePlaceholder")}
          value={values.phone}
          onChange={(e) =>
            change("phone", e.target.value.replace(/[^\d+\s-]/g, ""))
          }
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "login-phone-error" : undefined}
          className={inputClass}
        />
      </AuthField>

      <AuthField
        id="login-password"
        label={t("password")}
        error={err("password")}
      >
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
          value={values.password}
          onChange={(e) => change("password", e.target.value)}
          aria-invalid={!!errors.password}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
          className={inputClass}
        />
      </AuthField>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg bg-brand-red-soft px-3 py-2 text-[14px] text-destructive"
        >
          {t(formError)}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="mt-1 h-11 w-full gap-2.5 rounded-[10px] bg-brand-red text-base font-semibold text-white shadow-[0_6px_16px_-6px_rgba(226,38,59,.7)] hover:bg-brand-red/90"
      >
        {pending ? t("submitting") : t("loginButton")}
        {pending ? null : (
          <ArrowRightIcon className="size-[18px]" strokeWidth={2.4} />
        )}
      </Button>

      <p className="text-center text-[14.5px] text-muted-foreground">
        {t("newHere")}{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-primary underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("registerLink")}
        </button>
      </p>
    </form>
  );
}
