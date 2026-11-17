import type { PaymentMethod } from "@/config/payment";
import type { Booking, Checkout } from "@/types/api";
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
