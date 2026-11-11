"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeftRightIcon,
  CalendarDaysIcon,
  CircleDotIcon,
  MapPinIcon,
  TrainFrontIcon,
} from "lucide-react";
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
      className="scroll-mt-24 rounded-[18px] p-5 text-white shadow-[0_26px_50px_-24px_rgba(6,56,43,.75)] sm:p-6"
      style={{
        background:
          "repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 2px,transparent 2px 12px), linear-gradient(135deg,var(--primary),var(--brand-deep) 70%)",
      }}
    >
      <h2 className="mb-4 flex items-center gap-2.5 text-[22px] font-extrabold leading-tight tracking-tight">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/12">
          <TrainFrontIcon className="size-5" />
        </span>
        {t("title")}
      </h2>
      <div className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.25fr)_auto_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,.9fr)_auto]">
        <Field label={t("from")} htmlFor="from-in">
          <div className="relative">
            <CircleDotIcon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-primary" />
            <Input
              id="from-in"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder={t("placeholderFrom")}
              autoComplete="off"
              autoCapitalize="words"
              spellCheck={false}
              className="h-[52px] rounded-xl border-transparent bg-white pl-11 pr-3 text-[17px] font-semibold text-foreground placeholder:font-normal md:text-[17px]"
            />
          </div>
        </Field>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={swap}
          aria-label={t("swap")}
          className="mb-[9px] size-[34px] justify-self-center rounded-full border-white/25 bg-white/12 text-white hover:bg-white hover:text-primary"
        >
          <ArrowLeftRightIcon className="rotate-90 sm:rotate-0" />
        </Button>

        <Field label={t("to")} htmlFor="to-in">
          <div className="relative">
            <MapPinIcon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-primary" />
            <Input
              id="to-in"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder={t("placeholderTo")}
              autoComplete="off"
              autoCapitalize="words"
              spellCheck={false}
              className="h-[52px] rounded-xl border-transparent bg-white pl-11 pr-3 text-[17px] font-semibold text-foreground placeholder:font-normal md:text-[17px]"
            />
          </div>
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
                "flex h-[52px] w-full items-center justify-between gap-2 rounded-xl bg-white px-3.5 text-left text-[16px] font-semibold text-foreground outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-white/50 aria-expanded:ring-3 aria-expanded:ring-white/50",
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
              className="w-full rounded-xl border-transparent bg-white px-3.5 text-[16px] font-semibold text-foreground data-[size=default]:h-[52px]"
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
          className="h-[52px] rounded-xl bg-brand-red px-7 text-[16.5px] font-bold text-white shadow-[0_10px_22px_-8px_rgba(226,38,59,.9)] hover:bg-brand-red/90 sm:col-span-3 lg:col-span-1"
        >
          {t("submit")}
        </Button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "text-sm",
          message && "mt-3",
          result?.kind === "ok" ? "text-[#9fe0c4]" : "text-[#ffb3bc]",
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
        className="mb-[6px] block font-mono text-[11px] font-medium uppercase tracking-[.08em] text-[#bcd6cc]"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
