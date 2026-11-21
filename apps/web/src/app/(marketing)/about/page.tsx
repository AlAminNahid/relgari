import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";

export const metadata: Metadata = { title: "About" };

const PORTFOLIO = "https://alamin-nahid.xyz/";
const FEATURES = ["queue", "batches", "seats", "cancel", "ticket", "language"];

export default function AboutPage() {
  const t = useTranslations("about");
  const h2 = "text-[20px] font-extrabold text-brand-deep";
  const p = "mt-2 text-[15.5px] leading-relaxed text-muted-foreground";

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-20 pt-12">
      <h1 className="text-[clamp(26px,3.6vw,34px)] font-extrabold tracking-tight text-brand-deep">
        {t("title")}
      </h1>
      <p className={p}>{t("intro")}</p>

      <section className="mt-9">
        <h2 className={h2}>{t("whyTitle")}</h2>
        <p className={p}>{t("whyText")}</p>
      </section>

      <section className="mt-9">
        <h2 className={h2}>{t("doesTitle")}</h2>
        <ul className="mt-3 space-y-2.5">
          {FEATURES.map((key) => (
            <li
              key={key}
              className="rounded-xl border bg-card px-4 py-3 text-[15px] text-muted-foreground"
            >
              <b className="text-foreground">{t(`features.${key}.title`)}</b>{" "}
              {t(`features.${key}.text`)}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-9">
        <h2 className={h2}>{t("honestTitle")}</h2>
        <p className={p}>{t("honestText")}</p>
        <p className="mt-3 rounded-xl bg-brand-red-soft px-4 py-3 text-[15px] font-medium text-brand-red">
          {t("disclaimer")}
        </p>
      </section>

      <section className="mt-9">
        <h2 className={h2}>{t("builtTitle")}</h2>
        <p className={p}>
          {t("builtText")}{" "}
          <Link
            href="/contact"
            className="font-semibold text-primary hover:underline"
          >
            {t("contactLink")}
          </Link>{" "}
          {t("or")}{" "}
          <a
            href={PORTFOLIO}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            {t("portfolioLink")}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
