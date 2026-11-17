import type { Metadata } from "next";
import { CheckTicket } from "@/components/sections/verify/check-ticket";

export const metadata: Metadata = { title: "Check a ticket" };

export default function VerifyIndexPage() {
  return <CheckTicket />;
}
