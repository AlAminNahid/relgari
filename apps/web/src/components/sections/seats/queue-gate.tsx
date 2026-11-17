"use client";

import { useEffect, useState } from "react";
import { TrainFrontIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { getVisitorId } from "@/lib/visitor";
import { joinQueue, leaveQueue, type QueueStatus } from "@/services/queue";
import type { SeatQuery } from "@/services/seats";

const WAITING_ASK_MS = 3_000;
const INSIDE_ASK_MS = 15_000;
const FAILED_ASK_MS = 5_000;

export function QueueGate({
  query,
  results,
  children,
}: {
  query: SeatQuery;
  results: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("queue");
  const format = useFormatter();
  const router = useRouter();
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [unreachable, setUnreachable] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const id = getVisitorId();
    const ask = async () => {
      try {
        const next = await joinQueue(query, id);
        if (!active) return;
        setStatus(next);
        setUnreachable(false);
        timer = setTimeout(
          () => void ask(),
          next.state === "admitted" ? INSIDE_ASK_MS : WAITING_ASK_MS,
        );
      } catch {
        if (!active) return;
        setUnreachable(true);
        timer = setTimeout(() => void ask(), FAILED_ASK_MS);
      }
    };
    void ask();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [query]);

  if (status?.state === "admitted" || (status === null && unreachable)) {
    return <>{children}</>;
  }

  if (status === null) {
    return (
      <p className="py-32 text-center text-muted-foreground">{t("checking")}</p>
    );
  }

  const minutes = Math.ceil((status.etaSeconds ?? 0) / 60);
  return (
    <div className="mx-auto max-w-[520px] px-5 pb-24 pt-16">
      <div className="rounded-[22px] border bg-card px-6 py-10 text-center shadow-[0_26px_50px_-28px_rgba(6,56,43,.5)]">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-soft text-primary">
          <TrainFrontIcon className="size-7" />
        </span>
        <h1 className="mt-4 text-[24px] font-extrabold leading-tight text-brand-deep">
          {t("title")}
        </h1>
        <p className="mt-2 text-[15.5px] text-muted-foreground">{t("body")}</p>

        <div className="mt-6 rounded-2xl bg-secondary px-4 py-5">
          <p className="font-mono text-[11.5px] uppercase tracking-[.08em] text-muted-foreground">
            {t("place")}
          </p>
          <p className="mt-1 text-[44px] font-extrabold leading-none tabular-nums text-primary">
            {format.number(status.position ?? 0)}
          </p>
          <p className="mt-1 text-[14.5px] text-muted-foreground">
            {t("of", { waiting: status.waiting })}
          </p>
          <p className="mt-3 text-[15.5px] font-semibold text-brand-deep">
            {minutes <= 1 ? t("etaSoon") : t("eta", { minutes })}
          </p>
        </div>

        <p
          role="status"
          className="mt-5 flex items-start justify-center gap-2 text-left text-[14px] text-muted-foreground"
        >
          <span className="mt-1.5 size-2 shrink-0 animate-pulse rounded-full bg-primary" />
          {t("keep")}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            void leaveQueue(query, getVisitorId()).catch(() => undefined);
            router.push(results);
          }}
          className="mt-6 h-11 rounded-xl px-6 font-semibold"
        >
          {t("leave")}
        </Button>
      </div>
    </div>
  );
}
