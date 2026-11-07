"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRightIcon, CalendarDaysIcon } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { bn as bnLocale, enUS } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLASS_KEYS, MAX_DAYS_AHEAD, ROUTE_EVENT } from "@/config/site";
import { useToday } from "@/hooks/use-today";
import { cn } from "@/lib/utils";

type Result =
  | { kind: "both" | "same" }
  | { kind: "ok"; from: string; to: string; date: Date; cls: string };

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function SearchBar() {
  const t = useTranslations("search");
  const tc = useTranslations("classNames");
  const locale = useLocale();
  const format = useFormatter();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cls, setCls] = useState<string>("shovan");
  const today = useToday();
  const [picked, setDate] = useState<Date>();
  const date = picked ?? today;
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // The departure board fills in a route when "Book" is pressed.
  useEffect(() => {
    const onRoute = (e: Event) => {
      const detail = (e as CustomEvent<{ from: string; to: string }>).detail;
      setFrom(detail.from);
      setTo(detail.to);
      setResult(null);
    };
    window.addEventListener(ROUTE_EVENT, onRoute);
    return () => window.removeEventListener(ROUTE_EVENT, onRoute);
  }, []);

  const shortDate = (d: Date) =>
    format.dateTime(d, { day: "numeric", month: "short", year: "numeric" });
  const longDate = (d: Date) =>
    format.dateTime(d, { day: "numeric", month: "long", year: "numeric" });

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const f = from.trim();
    const tt = to.trim();
    if (!f || !tt) return setResult({ kind: "both" });
    if (f.toLowerCase() === tt.toLowerCase())
      return setResult({ kind: "same" });
    setResult({
      kind: "ok",
      from: f,
      to: tt,
      date: date ?? new Date(),
      cls,
    });
  }

  let message = "";
  if (result?.kind === "both") message = t("enterBoth");
  else if (result?.kind === "same") message = t("enterDifferent");
  else if (result?.kind === "ok") {
    message = t("searching", {
      from: result.from,
      to: result.to,
      date: longDate(result.date),
      cls: tc(result.cls),
    });
  }

  return (
    <form
      id="search"
      onSubmit={onSubmit}
      noValidate
      className="scroll-mt-24 rounded-[14px] border bg-card p-4 shadow-[0_18px_40px_-26px_rgba(6,56,43,.45)] sm:px-[18px]"
    >
      <div className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.25fr)_auto_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,.9fr)_auto]">
        <Field label={t("from")} htmlFor="from-in">
          <Input
            id="from-in"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder={t("placeholderFrom")}
            autoComplete="off"
            autoCapitalize="words"
            spellCheck={false}
            className="h-11 rounded-[10px] bg-background px-3 text-[15.5px]"
          />
        </Field>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={swap}
          aria-label={t("swap")}
          className="mb-[5px] size-[34px] justify-self-center rounded-full bg-secondary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <ArrowLeftRightIcon className="rotate-90 sm:rotate-0" />
        </Button>

        <Field label={t("to")} htmlFor="to-in">
          <Input
            id="to-in"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={t("placeholderTo")}
            autoComplete="off"
            autoCapitalize="words"
            spellCheck={false}
            className="h-11 rounded-[10px] bg-background px-3 text-[15.5px]"
          />
        </Field>

        <Field
          label={t("date")}
          htmlFor="date-btn"
          className="sm:col-start-1 lg:col-auto"
        >
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              id="date-btn"
              className={cn(
                "flex h-11 w-full items-center justify-between gap-2 rounded-[10px] border-[1.5px] bg-background px-3 text-left text-[15.5px] font-medium outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-expanded:border-ring",
                !date && "text-muted-foreground",
              )}
            >
              <span className="truncate">
                {date ? shortDate(date) : t("pickDate")}
              </span>
              <CalendarDaysIcon className="size-[18px] shrink-0 text-primary" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                defaultMonth={date}
                onSelect={(d) => {
                  if (d) {
                    setDate(d);
                    setOpen(false);
                  }
                }}
                startMonth={today}
                endMonth={today ? addDays(today, MAX_DAYS_AHEAD) : undefined}
                disabled={
                  today
                    ? { before: today, after: addDays(today, MAX_DAYS_AHEAD) }
                    : undefined
                }
                locale={locale === "bn" ? bnLocale : enUS}
                autoFocus
                className="[--cell-size:--spacing(9)]"
              />
            </PopoverContent>
          </Popover>
        </Field>

        <Field
          label={t("class")}
          htmlFor="cls-btn"
          className="sm:col-span-2 lg:col-span-1"
        >
          <Select
            value={cls}
            onValueChange={(v) => v && setCls(v)}
            items={CLASS_KEYS.map((k) => ({ value: k, label: tc(k) }))}
          >
            <SelectTrigger
              id="cls-btn"
              className="w-full rounded-[10px] bg-background px-3 text-[15.5px] font-medium data-[size=default]:h-11"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLASS_KEYS.map((k) => (
                <SelectItem key={k} value={k}>
                  {tc(k)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Button
          type="submit"
          className="h-11 rounded-[10px] bg-brand-red px-6 text-[15.5px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(226,38,59,.7)] hover:bg-brand-red/90 sm:col-span-3 lg:col-span-1"
        >
          {t("submit")}
        </Button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "text-sm",
          message && "mt-2",
          result?.kind === "ok" ? "text-primary" : "text-destructive",
        )}
      >
        {message}
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <Label
        htmlFor={htmlFor}
        className="mb-[5px] block font-mono text-[11px] font-medium uppercase tracking-[.08em] text-muted-foreground"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
