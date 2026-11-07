import { useTranslations } from "next-intl";
import type { DepartureRow } from "@/types/landing";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookLink } from "@/components/sections/landing/departure-board/book-link";
import { SectionHead } from "@/components/sections/landing/section-head";

export function DepartureBoard() {
  const t = useTranslations("departures");
  const tc = useTranslations("classNames");
  const rows = t.raw("rows") as DepartureRow[];
  const head =
    "px-4 font-mono text-[11.5px] font-medium uppercase tracking-[.08em] text-[#6fa591]";

  return (
    <section id="routes" className="scroll-mt-20 py-[84px]">
      <div className="mx-auto max-w-[1140px] px-5">
        <SectionHead
          eyebrow={t("eyebrow")}
          title={t("title")}
          body={t("body")}
        />
        <div className="overflow-hidden rounded-2xl border border-[#14372b] bg-[#0b1f18] px-2 pb-3 pt-2 text-[#e8f4ee]">
          <div className="px-4 py-3 font-mono text-[12.5px] font-medium uppercase tracking-[.08em] text-[#7fb7a1]">
            <span>{t("boardTitle")}</span>
          </div>
          <Table className="min-w-[680px]">
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className={head}>{t("headers.train")}</TableHead>
                <TableHead className={head}>{t("headers.route")}</TableHead>
                <TableHead className={head}>{t("headers.departs")}</TableHead>
                <TableHead className={head}>{t("headers.arrives")}</TableHead>
                <TableHead className={head}>{t("headers.classes")}</TableHead>
                <TableHead className={head}>
                  <span className="sr-only">{t("book")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.name}
                  className="border-t border-[#16382c] hover:bg-transparent"
                >
                  <TableCell className="px-4 py-[13px] text-[17px] font-semibold text-white">
                    {r.name}
                  </TableCell>
                  <TableCell className="px-4 font-mono text-base font-medium">
                    {r.route}
                  </TableCell>
                  <TableCell className="px-4 font-mono text-base font-medium">
                    {r.departs}
                  </TableCell>
                  <TableCell className="px-4 font-mono text-base font-medium">
                    {r.arrives}
                  </TableCell>
                  <TableCell className="px-4">
                    <span className="flex flex-wrap gap-1">
                      {r.few ? (
                        <Badge className="rounded-[5px] bg-brand-red text-white">
                          {t("few")}
                        </Badge>
                      ) : null}
                      {r.tags.map((k) => (
                        <Badge
                          key={k}
                          className="rounded-[5px] bg-[#14372b] text-[#9fd8c0]"
                        >
                          {tc(k)}
                        </Badge>
                      ))}
                    </span>
                  </TableCell>
                  <TableCell className="px-4">
                    <BookLink route={r.route}>{t("book")}</BookLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{t("note")}</p>
      </div>
    </section>
  );
}
