"use client";

import { useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { AuthField } from "@/components/sections/auth/auth-field";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  getFieldErrors,
  loginSchema,
  type AuthErrorKey,
} from "@/lib/validations";

const inputClass = "h-11 rounded-[10px] bg-background px-3 text-[15.5px]";

export function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const t = useTranslations("auth");
  const [values, setValues] = useState({ phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, AuthErrorKey>>({});

  const change = (field: "phone" | "password", value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const found = getFieldErrors(result.error);
      setErrors(found);
      const first = (["phone", "password"] as const).find((f) => found[f]);
      if (first) document.getElementById(`login-${first}`)?.focus();
      return;
    }
    setErrors({});
  }

  const err = (f: string) => (errors[f] ? t(`errors.${errors[f]}`) : undefined);

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

      <Button
        type="submit"
        className="mt-1 h-11 w-full gap-2.5 rounded-[10px] bg-brand-red text-base font-semibold text-white shadow-[0_6px_16px_-6px_rgba(226,38,59,.7)] hover:bg-brand-red/90"
      >
        {t("loginButton")}
        <ArrowRightIcon className="size-[18px]" strokeWidth={2.4} />
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
