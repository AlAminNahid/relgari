"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  MESSAGE_MAX,
  contactSchema,
  type ContactErrorKey,
} from "@/lib/contact";

const field =
  "w-full rounded-xl border-[1.5px] bg-background px-3.5 text-[16px] outline-none focus:border-primary";
const label =
  "mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-[.08em] text-muted-foreground";

const EMPTY = { name: "", email: "", message: "", website: "" };

export function ContactForm() {
  const t = useTranslations("contact");
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string>();
  const [working, setWorking] = useState(false);
  const [sent, setSent] = useState(false);

  const set =
    (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setError(undefined);
    };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const checked = contactSchema.safeParse(form);
    if (!checked.success) {
      const key = (checked.error.issues[0]?.message ??
        "name") as ContactErrorKey;
      return setError(t(`errors.${key}`));
    }
    setWorking(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        setForm(EMPTY);
      } else if (res.status === 429) {
        const wait = Number(res.headers.get("retry-after"));
        setError(
          t("errors.TOO_MANY_REQUESTS", {
            minutes: Math.max(1, Math.ceil((wait || 3600) / 60)),
          }),
        );
      } else {
        setError(t("errors.SEND_FAILED"));
      }
    } catch {
      setError(t("errors.SEND_FAILED"));
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="mx-auto max-w-[520px] px-5 pb-20 pt-12">
      <h1 className="text-[clamp(26px,3.6vw,34px)] font-extrabold tracking-tight text-brand-deep">
        {t("title")}
      </h1>
      <p className="mt-2 text-[15.5px] text-muted-foreground">{t("intro")}</p>

      {sent ? (
        <div className="mt-6 rounded-2xl border bg-card p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-white">
            <CheckIcon className="size-8" strokeWidth={3} />
          </span>
          <p className="mt-4 text-[18px] font-extrabold text-brand-deep">
            {t("sentTitle")}
          </p>
          <p className="mt-1 text-[15px] text-muted-foreground">
            {t("sentBody")}
          </p>
          <Button
            variant="outline"
            onClick={() => setSent(false)}
            className="mt-5 h-11 rounded-xl px-6 font-semibold"
          >
            {t("another")}
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => void submit(e)}
          className="mt-6 space-y-4 rounded-2xl border bg-card p-5"
          noValidate
        >
          <div>
            <label htmlFor="c-name" className={label}>
              {t("name")}
            </label>
            <input
              id="c-name"
              value={form.name}
              onChange={set("name")}
              autoComplete="name"
              className={`${field} h-12`}
            />
          </div>
          <div>
            <label htmlFor="c-email" className={label}>
              {t("email")}
            </label>
            <input
              id="c-email"
              type="email"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              className={`${field} h-12`}
            />
          </div>
          <div>
            <label htmlFor="c-message" className={label}>
              {t("message")}
            </label>
            <textarea
              id="c-message"
              value={form.message}
              onChange={set("message")}
              rows={5}
              maxLength={MESSAGE_MAX}
              className={`${field} resize-y py-3`}
            />
          </div>
          {/* Hidden from people; bots fill it in. */}
          <div aria-hidden="true" className="absolute -left-[9999px]">
            <input
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={set("website")}
            />
          </div>
          {error && (
            <p
              role="alert"
              className="text-[14px] font-medium text-destructive"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={working}
            className="h-12 w-full rounded-xl text-[15.5px] font-bold"
          >
            {working ? t("sending") : t("send")}
          </Button>
        </form>
      )}
    </div>
  );
}
