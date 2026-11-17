const number = (name: string, fallback: number) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export const queueSettings = () => ({
  capacity: number('QUEUE_CAPACITY', 150),
  activeIdleMs: number('QUEUE_ACTIVE_IDLE_MS', 60_000),
  waitingGraceMs: number('QUEUE_WAITING_GRACE_MS', 120_000),
});
