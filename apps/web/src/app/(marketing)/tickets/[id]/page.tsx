import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { TicketView } from "@/components/sections/ticket/ticket-view";
import { getBooking } from "@/services/bookings.server";

export const metadata: Metadata = { title: "E-ticket" };

export default async function TicketPage({
  params,
}: PageProps<"/tickets/[id]">) {
  const { id } = await params;
  const booking = await getBooking(id);
  if (!booking) notFound();

  const host = (await headers()).get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const qrSvg = await QRCode.toString(
    `${proto}://${host}/verify/${booking.pnr}`,
    {
      type: "svg",
      margin: 0,
      color: { dark: "#06382b", light: "#00000000" },
    },
  );
  return <TicketView booking={booking} qrSvg={qrSvg} />;
}
