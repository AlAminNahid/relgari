import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { VerifyResult } from "@/components/sections/verify/verify-result";
import { verifyTicket } from "@/services/verify.server";

export const metadata: Metadata = { title: "Check a ticket" };

export default async function VerifyPage({
  params,
}: PageProps<"/verify/[pnr]">) {
  const { pnr } = await params;
  const code = decodeURIComponent(pnr).trim().toUpperCase();
  const [t, ticket] = await Promise.all([
    getTranslations("verify"),
    verifyTicket(code),
  ]);

  if (!ticket) {
    return (
      <div className="mx-auto max-w-[520px] px-5 pb-20 pt-14 text-center">
        <p className="rounded-2xl border bg-card px-6 py-10">
          <b className="block text-[20px] text-brand-red">
            {t("notFoundTitle")}
          </b>
          <span className="mt-1 block text-[15px] text-muted-foreground">
            {t("notFoundBody", { pnr: code.slice(0, 12) })}
          </span>
        </p>
        <Link
          href="/verify"
          className="mt-5 inline-block font-semibold text-primary hover:underline"
        >
          {t("tryAgain")}
        </Link>
      </div>
    );
  }
  return <VerifyResult ticket={ticket} />;
}
