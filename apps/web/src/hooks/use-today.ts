import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60000);
  return () => clearInterval(id);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const onServer = () => null;

export function useToday(): Date | undefined {
  const ms = useSyncExternalStore(subscribe, startOfToday, onServer);
  return ms === null ? undefined : new Date(ms);
}
