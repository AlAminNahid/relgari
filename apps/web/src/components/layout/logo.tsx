import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function TrainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <rect width="40" height="40" rx="10" fill="#00694b" />
      <path
        d="M13.5 30.5l-3.5 6M26.5 30.5l3.5 6M10.5 34h19"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="11" y="6" width="18" height="24" rx="5.5" fill="#fff" />
      <rect x="14" y="10" width="12" height="9" rx="2.2" fill="#00694b" />
      <path d="M20 10v9" stroke="#fff" strokeWidth="1.4" />
      <circle cx="15.8" cy="24.5" r="2" fill="#e2263b" />
      <circle cx="24.2" cy="24.5" r="2" fill="#e2263b" />
    </svg>
  );
}

export function Logo({
  light = false,
  className,
}: {
  light?: boolean;
  className?: string;
}) {
  const t = useTranslations("brand");
  return (
    <a
      href="#top"
      aria-label={t("home")}
      className={cn(
        "flex items-center gap-2.5 text-[22px] font-extrabold tracking-tight",
        light ? "text-white" : "text-brand-deep",
        className,
      )}
    >
      <TrainIcon className="size-[34px] shrink-0" />
      <span className="flex flex-col leading-[1.05]">
        <span>
          {t("rel")}
          <em
            className={cn(
              "not-italic",
              light ? "text-[#ff8a98]" : "text-brand-red",
            )}
          >
            {t("gari")}
          </em>
        </span>
        {t("bn") ? (
          <small
            className={cn(
              "mt-0.5 text-[13px] font-semibold tracking-normal",
              light ? "text-[#bcd6cc]" : "text-primary",
            )}
          >
            {t("bn")}
          </small>
        ) : null}
      </span>
    </a>
  );
}
