import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Checkout } from "@/components/sections/checkout/checkout";
import { getCurrentUser } from "@/services/auth.server";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  // Seats are only held for signed-in people, so there is nothing to pay for without an account.
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return <Checkout />;
}
