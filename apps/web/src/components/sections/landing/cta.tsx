import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Cta() {
  const t = useTranslations("cta");
  return (
    <section>
      <div className="mx-auto max-w-[1140px] px-5">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center text-white">
          <span className="absolute inset-x-0 bottom-0 h-2 bg-brand-red" />
          <h2 className="mb-3 text-[clamp(30px,4.4vw,48px)] font-extrabold leading-[1.1] text-balance">
            {t("title")}
          </h2>
          <p className="mb-[26px] text-lg text-[#cfe8dd]">{t("text")}</p>
          <a
            href="#search"
            className={cn(
              buttonVariants(),
              "h-[50px] rounded-[10px] bg-brand-red px-[26px] text-base font-semibold text-white hover:bg-brand-red/90",
            )}
          >
            {t("button")}
          </a>
        </div>
      </div>
    </section>
  );
}
