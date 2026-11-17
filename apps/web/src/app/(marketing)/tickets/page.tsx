import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TicketsList } from "@/components/sections/ticket/tickets-list";
import { getCurrentUser } from "@/services/auth.server";
import { getLimit, listBookings } from "@/services/bookings.server";

export const metadata: Metadata = { title: "My tickets" };

export default async function TicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const [bookings, limit] = await Promise.all([listBookings(), getLimit()]);
  return <TicketsList bookings={bookings} limit={limit} />;
}
