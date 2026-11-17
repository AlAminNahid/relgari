import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { TicketView } from "@/components/sections/ticket/ticket-view";
import { getBooking } from "@/services/bookings.server";

export const metadata: Metadata = { title: "E-ticket" };

export default async function TicketPage({
  params,
}: PageProps<"/tickets/[id]">) {
  const { id } = await params;
  // Only the person who bought the ticket can open it: the API answers for them alone.
  const booking = await getBooking(id);
  if (!booking) notFound();

  const qrSvg = await QRCode.toString(`relgari:ticket:${booking.pnr}`, {
    type: "svg",
    margin: 0,
    color: { dark: "#06382b", light: "#00000000" },
  });
  return <TicketView booking={booking} qrSvg={qrSvg} />;
}
