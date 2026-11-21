import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/logo";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const link = "my-1.5 block hover:text-white";
  const head = "mb-2.5 text-base font-bold text-white";
  return (
    <footer className="mt-[84px] bg-brand-deep pb-7 pt-12 text-[15.5px] text-[#bcd6cc]">
      <div className="mx-auto max-w-[1140px] px-5">
        <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light className="mb-2.5" />
            <p>{t("tagline")}</p>
          </div>
          <div>
            <h4 className={head}>{t("product")}</h4>
            <Link className={link} href="/#routes">
              {nav("routes")}
            </Link>
            <Link className={link} href="/#seats">
              {nav("seats")}
            </Link>
          </div>
          <div>
            <h4 className={head}>{t("help")}</h4>
            <Link className={link} href="/#how">
              {nav("how")}
            </Link>
            <Link className={link} href="/verify">
              {t("check")}
            </Link>
          </div>
          <div>
            <h4 className={head}>{t("project")}</h4>
            <Link className={link} href="/about">
              {t("about")}
            </Link>
            <Link className={link} href="/contact">
              {t("contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
