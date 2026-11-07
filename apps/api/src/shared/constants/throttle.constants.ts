export const THROTTLE = {
  default: { limit: 100, minutes: 1 },
  account: { limit: 5, minutes: 15 },
  register: { limit: 10, hours: 1 },
} as const;
