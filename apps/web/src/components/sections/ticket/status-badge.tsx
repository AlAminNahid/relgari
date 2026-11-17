import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/api";

const STYLE: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  partly_cancelled: "bg-amber-100 text-amber-900",
  cancelled: "bg-brand-red-soft text-brand-red",
  departed: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const t = useTranslations("ticketPage");
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 font-mono text-[11.5px] font-bold uppercase tracking-[.08em]",
        STYLE[status],
        className,
      )}
    >
      {t(`status.${status}`)}
    </span>
  );
}
