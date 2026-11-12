import { useId } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// The Relgari mark: a train coach, seen head-on, on the red disc of the flag. Keep it in step with src/app/icon.svg.
export function TrainIcon({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b8a61" />
          <stop offset="1" stopColor="#00563d" />
        </linearGradient>
        <clipPath id={`${id}-tile`}>
          <rect width="64" height="64" rx="15" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-tile)`}>
        <rect width="64" height="64" fill={`url(#${id}-bg)`} />
        <circle cx="32" cy="29" r="21" fill="#e2263b" />
        <path
          d="M17 45V22c0-3.3 2.7-6 6-6h18c3.3 0 6 2.7 6 6v23c0 2.2-1.8 4-4 4H21c-2.2 0-4-1.8-4-4Z"
          fill="#fff"
        />
        <rect x="26" y="11.5" width="12" height="3" rx="1.5" fill="#fff" />
        <rect x="21" y="20.5" width="9.5" height="11" rx="2" fill="#06382b" />
        <rect x="33.5" y="20.5" width="9.5" height="11" rx="2" fill="#06382b" />
        <rect x="17" y="35" width="30" height="2.6" fill="#00694b" />
        <circle cx="23.5" cy="43" r="2.4" fill="#e2263b" />
        <circle cx="40.5" cy="43" r="2.4" fill="#e2263b" />
        <path
          d="M23 49v4M41 49v4"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
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
