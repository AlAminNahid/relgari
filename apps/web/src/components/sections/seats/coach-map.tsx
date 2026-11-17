import { useTranslations } from "next-intl";
import type { ClassKey } from "@/config/site";
import {
  SeatButton,
  type SeatView,
} from "@/components/sections/seats/seat-button";
import type { CoachMap as CoachMapData, SeatInfo } from "@/types/api";

interface Props {
  coach: CoachMapData;
  seatClass: ClassKey;
  viewOf: (seat: SeatInfo) => SeatView;
  busyId: string | null;
  locked: boolean;
  onPick: (seat: SeatInfo) => void;
}

export function CoachMap(props: Props) {
  return props.coach.cabins.length > 0 ? (
    <CabinCoach {...props} />
  ) : (
    <RowCoach {...props} />
  );
}

const placeholder = (
  <span
    aria-hidden="true"
    className="inline-block h-12 w-[52px] sm:h-[52px] sm:w-[60px]"
  />
);

// S_Chair and Snigdha: the coach as the Bangladesh Railway lays it out. Rows of two seats, the
// aisle, two seats, with gaps at the ends for the doors, and one table in the middle.
function RowCoach({ coach, viewOf, busyId, locked, onPick }: Props) {
  const t = useTranslations("seatPage");

  const at = new Map<string, SeatInfo>();
  for (const seat of coach.seats) at.set(`${seat.row}:${seat.column}`, seat);

  const cell = (row: number, column: number) => {
    const seat = at.get(`${row}:${column}`);
    if (!seat)
      return (
        <span key={column} className="block">
          {placeholder}
        </span>
      );
    return (
      <SeatButton
        key={seat.id}
        label={seat.label}
        view={viewOf(seat)}
        busy={busyId === seat.id}
        locked={locked}
        onPick={() => onPick(seat)}
      />
    );
  };

  const rows = Array.from({ length: coach.rowCount }, (_, row) => (
    <div key={row} className="contents">
      <div className="flex justify-center gap-2 sm:gap-2.5">
        {cell(row, 0)}
        {cell(row, 1)}
      </div>
      <div className="flex justify-center gap-2 sm:gap-2.5">
        {cell(row, 2)}
        {cell(row, 3)}
      </div>
      {row === coach.tableAfterRow && (
        // One square table, fixed to the side of the coach, between the two facing groups of seats.
        <>
          <span
            aria-hidden="true"
            className="-ml-3 h-12 rounded-r-xl border-y-2 border-r-2 border-[#c9a46b] bg-[#e9d3a8] sm:-ml-5 sm:h-14"
          />
          <span
            aria-hidden="true"
            className="-mr-3 h-12 rounded-l-xl border-y-2 border-l-2 border-[#c9a46b] bg-[#e9d3a8] sm:-mr-5 sm:h-14"
          />
        </>
      )}
    </div>
  ));

  return (
    <div className="mx-auto w-full max-w-[520px]">
      <p className="mb-2 text-center font-mono text-[11px] uppercase tracking-[.12em] text-muted-foreground">
        {t("front")}
      </p>
      <div className="rounded-[32px] border-2 border-brand-deep/20 bg-card px-3 py-5 shadow-[0_18px_40px_-26px_rgba(6,56,43,.6)] sm:px-5">
        <div
          aria-hidden="true"
          className="mb-3 grid grid-cols-2 gap-x-10 font-mono text-[10.5px] uppercase tracking-[.08em] text-muted-foreground sm:gap-x-14"
        >
          <span className="flex justify-between px-2">
            <span>{t("window")}</span>
            <span>{t("aisle")}</span>
          </span>
          <span className="flex justify-between px-2">
            <span>{t("aisle")}</span>
            <span>{t("window")}</span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-2.5 sm:gap-x-14">
          {rows}
        </div>
      </div>
      <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[.12em] text-muted-foreground">
        {t("rear")}
      </p>
    </div>
  );
}

// AC coach, as on the Bangladesh Railway map: cabins in a single column, each with one or two
// sofas. By day a sofa is a row of 3 seats, numbered from the right. By night it is a row of a lower
// and an upper berth.
function CabinCoach({
  coach,
  seatClass,
  viewOf,
  busyId,
  locked,
  onPick,
}: Props) {
  const t = useTranslations("seatPage");
  const byDay = seatClass === "acs";

  return (
    <div className="mx-auto w-full max-w-[520px]">
      <p className="mb-2 text-center font-mono text-[11px] uppercase tracking-[.12em] text-muted-foreground">
        {t("front")}
      </p>
      <div className="rounded-[32px] border-2 border-brand-deep/20 bg-card px-3 py-5 shadow-[0_18px_40px_-26px_rgba(6,56,43,.6)] sm:px-5">
        <div className="flex flex-col gap-3.5">
          {coach.cabins.map((cabin) => {
            const seats = coach.seats.filter((s) => s.cabin === cabin.number);
            return (
              <section
                key={cabin.number}
                aria-label={t("cabin", { number: cabin.number })}
                className="flex items-center gap-3 rounded-2xl bg-background/70 p-3"
              >
                <span className="w-16 shrink-0 font-mono text-[11px] uppercase tracking-[.08em] text-muted-foreground">
                  {t("cabin", { number: cabin.number })}
                </span>
                <div className="flex flex-1 flex-col items-center gap-2">
                  {Array.from({ length: cabin.sofas }, (_, sofa) => (
                    <div key={sofa} className="flex gap-2">
                      {seats
                        .filter((s) => s.sofa === sofa)
                        .sort((a, b) =>
                          byDay ? b.number - a.number : a.number - b.number,
                        )
                        .map((seat) => (
                          <SeatButton
                            key={seat.id}
                            label={seat.label}
                            view={viewOf(seat)}
                            busy={busyId === seat.id}
                            locked={locked}
                            onPick={() => onPick(seat)}
                          />
                        ))}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[.12em] text-muted-foreground">
        {t("rear")}
      </p>
    </div>
  );
}
