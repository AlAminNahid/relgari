import { cn } from "@/lib/utils";

export type SeatView = "free" | "taken" | "mine";

export function SeatButton({
  label,
  view,
  busy,
  locked,
  onPick,
}: {
  label: string;
  view: SeatView;
  busy: boolean;
  // Free seats cannot be picked while the person already holds the most they can, or none are on sale.
  locked: boolean;
  onPick: () => void;
}) {
  const disabled = view === "taken" || busy || (view === "free" && locked);
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={view === "mine"}
      aria-label={label}
      onClick={onPick}
      className={cn(
        "grid h-12 place-items-center rounded-xl border-[1.5px] font-mono font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:h-[52px]",
        // Berth labels such as JA-LO-12 are longer, so they get a little more room.
        label.length > 7
          ? "w-[68px] text-[10.5px] sm:w-[76px] sm:text-[11.5px]"
          : "w-[52px] text-[12px] sm:w-[60px] sm:text-[13px]",
        view === "free" &&
          !locked &&
          "border-brand-deep/45 bg-card text-brand-deep hover:border-primary hover:bg-secondary",
        view === "free" &&
          locked &&
          "border-border bg-card text-muted-foreground/70",
        view === "taken" &&
          "border-transparent bg-[#d98f3e] text-white opacity-90",
        view === "mine" &&
          "border-primary bg-primary text-primary-foreground shadow-md hover:bg-primary/90",
        busy && "opacity-60",
      )}
    >
      {label}
    </button>
  );
}
