export const PAYMENT_METHODS = ["bkash", "nagad", "rocket", "card"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const WALLETS = ["bkash", "nagad", "rocket"] as const;

export const METHOD_STYLE: Record<
  PaymentMethod,
  { name: string; bg: string; text: string }
> = {
  bkash: { name: "bKash", bg: "#e2136e", text: "#ffffff" },
  nagad: { name: "Nagad", bg: "#f6921e", text: "#1d1d1d" },
  rocket: { name: "Rocket", bg: "#8c3494", text: "#ffffff" },
  card: { name: "Card", bg: "#06382b", text: "#ffffff" },
};

export const TEST_VALUES = {
  number: "01711111111",
  otp: "12345",
  pin: "1234",
  card: "4242 4242 4242 4242",
  cardExpiry: "12/30",
  cardCvc: "123",
};
