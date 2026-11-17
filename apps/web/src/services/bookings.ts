import type { PaymentMethod } from "@/config/payment";
import type {
  Booking,
  CancelQuote,
  Checkout,
  PurchaseLimit,
  Refund,
} from "@/types/api";
import { api } from "@/services/http";

export type Payment =
  | {
      method: Exclude<PaymentMethod, "card">;
      number: string;
      otp: string;
      pin: string;
    }
  | {
      method: "card";
      number: string;
      name: string;
      expiry: string;
      cvc: string;
    };

export function startCheckout() {
  return api<Checkout>("/bookings/checkout", { method: "POST" });
}

export function pay(payment: Payment) {
  return api<Booking>("/bookings", { method: "POST", body: payment });
}

export function cancelQuote(bookingId: string, seatIds: string[]) {
  const query = new URLSearchParams({ seats: seatIds.join(",") });
  return api<CancelQuote>(`/bookings/${bookingId}/cancel-quote?${query}`);
}

export function cancelSeats(bookingId: string, seatIds: string[]) {
  return api<Refund>(`/bookings/${bookingId}/cancel`, {
    method: "POST",
    body: { seatIds },
  });
}

export function getLimit() {
  return api<PurchaseLimit>("/bookings/limits");
}
