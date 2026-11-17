import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { QueueGate } from "@/components/sections/seats/queue-gate";
import { SeatPicker } from "@/components/sections/seats/seat-picker";
import { CLASS_KEYS, DEFAULT_CLASS } from "@/config/site";
import { isDateString } from "@/lib/dates";
import { getCurrentUser } from "@/services/auth.server";
import { fetchSeatMap } from "@/services/seats.server";

export const metadata: Metadata = { title: "Choose seats" };

const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function SeatsPage({ searchParams }: PageProps<"/seats">) {
  const params = await searchParams;
  const train = Number(one(params.train));
  const from = one(params.from)?.toUpperCase() ?? "";
  const to = one(params.to)?.toUpperCase() ?? "";
  const date = one(params.date) ?? "";
  const cls =
    CLASS_KEYS.find((key) => key === one(params.class)) ?? DEFAULT_CLASS;

  const [t, user] = await Promise.all([
    getTranslations("seatPage"),
    getCurrentUser(),
  ]);

  const valid =
    Number.isInteger(train) && train > 0 && from && to && isDateString(date);
  const outcome = valid
    ? await fetchSeatMap({ train, from, to, date, cls })
    : null;

  if (!outcome?.ok) {
    const code = outcome?.code;
    const message =
      code === "JOURNEY_NOT_FOUND" || code === "CLASS_NOT_AVAILABLE"
        ? t("notAvailable")
        : code === "DATE_OUT_OF_RANGE"
          ? t("dateOut")
          : code === "UNAVAILABLE"
            ? t("unavailable")
            : t("invalid");
    return (
      <div className="mx-auto max-w-[640px] px-5 py-20 text-center">
        <p className="rounded-2xl border bg-card px-5 py-8 text-[16px] text-muted-foreground">
          {message}
        </p>
        <Link
          href="/"
          className="mt-5 inline-block font-semibold text-primary hover:underline"
        >
          {t("backHome")}
        </Link>
      </div>
    );
  }

  const query = { train, from, to, date, cls };
  const results = `/search?${new URLSearchParams({ from, to, date, class: cls })}`;
  return (
    <QueueGate
      key={`${train}-${from}-${to}-${date}-${cls}`}
      query={query}
      results={results}
    >
      <SeatPicker query={query} initialMap={outcome.data} user={user} />
    </QueueGate>
  );
}
