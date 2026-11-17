export const PAYMENT = {
  serviceChargePerSeat: 20,
  wallet: {
    otp: '12345',
    pin: '1234',
    insufficientBalancePin: '0000',
  },
  card: {
    successNumber: '4242424242424242',
    declinedNumber: '4000000000000002',
  },
} as const;
