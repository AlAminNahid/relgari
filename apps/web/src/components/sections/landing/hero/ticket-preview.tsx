import { useTranslations } from "next-intl";

function qrCells() {
  let seed = 7;
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) continue;
      if (next() > 0.52) cells.push({ x, y });
    }
  }
  return cells;
}
const CELLS = qrCells();

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x} y={y} width="7" height="7" fill="#06382b" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#e2263b" />
    </>
  );
}

export function TicketPreview() {
  const t = useTranslations("ticket");
  const tc = useTranslations("classNames");
  return (
    <div aria-hidden="true" className="relative flex justify-center p-2.5">
      <div className="relative w-full max-w-[400px] rounded-[18px] border bg-card shadow-[0_30px_50px_-28px_rgba(6,56,43,.55)] sm:rotate-[2.5deg]">
        <div className="flex items-center justify-between rounded-t-[17px] bg-primary px-5 py-4 text-primary-foreground">
          <b className="text-lg font-bold">{t("title")}</b>
          <span className="rounded-full bg-brand-red px-2.5 py-0.5 font-mono text-xs font-medium">
            {t("confirmed")}
          </span>
        </div>
        <div className="px-5 py-[18px]">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[28px] font-extrabold text-brand-deep">
                DAC
              </div>
              <small className="block font-mono text-xs text-muted-foreground">
                {t("fromName")} · {t("depart")}
              </small>
            </div>
            <div
              className="relative h-0.5 flex-1"
              style={{
                background:
                  "repeating-linear-gradient(90deg,var(--primary) 0 6px,transparent 6px 11px)",
              }}
            >
              <span className="absolute -right-0.5 -top-1 border-[5px] border-transparent border-l-[8px] border-l-primary" />
            </div>
            <div className="text-right">
              <div className="text-[28px] font-extrabold text-brand-deep">
                CGP
              </div>
              <small className="block font-mono text-xs text-muted-foreground">
                {t("toName")} · {t("arrive")}
              </small>
            </div>
          </div>
          <div className="mt-[18px] grid grid-cols-3 gap-2.5">
            {[
              [t("coach"), "KA"],
              [t("seat"), t("seatValue")],
              [t("class"), tc("snigdha")],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-background px-2.5 py-2">
                <small className="block font-mono text-[11px] uppercase text-muted-foreground">
                  {k}
                </small>
                <b>{v}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mx-3.5 border-t-2 border-dashed">
          <span className="absolute -left-6 -top-[11px] size-5 rounded-full border bg-background" />
          <span className="absolute -right-6 -top-[11px] size-5 rounded-full border bg-background" />
        </div>
        <div className="flex items-center gap-4 px-5 pb-5 pt-4">
          <svg
            viewBox="0 0 21 21"
            shapeRendering="crispEdges"
            className="size-[92px] shrink-0"
          >
            <rect width="21" height="21" fill="#fff" />
            {CELLS.map((c) => (
              <rect
                key={`${c.x}-${c.y}`}
                x={c.x}
                y={c.y}
                width="1"
                height="1"
                fill="#10201a"
              />
            ))}
            <Finder x={0} y={0} />
            <Finder x={14} y={0} />
            <Finder x={0} y={14} />
          </svg>
          <p className="text-sm text-muted-foreground">
            <b className="block text-base text-foreground">{t("gate")}</b>
            {t("gateNote")}
          </p>
        </div>
        <div className="absolute -bottom-3.5 -right-1.5 -rotate-6 rounded-full bg-brand-red px-3.5 py-2 text-[13px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(226,38,59,.8)]">
          {t("held")}
        </div>
      </div>
    </div>
  );
}
