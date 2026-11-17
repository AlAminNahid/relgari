import type { SeatQuery } from "@/services/seats";
import { api } from "@/services/http";

export interface QueueStatus {
  state: "admitted" | "waiting";
  position: number | null;
  waiting: number;
  capacity: number;
  etaSeconds: number | null;
}

export function joinQueue(q: SeatQuery, visitorId: string) {
  return api<QueueStatus>("/queue/join", {
    method: "POST",
    body: { train: q.train, from: q.from, date: q.date, visitorId },
  });
}

export function leaveQueue(q: SeatQuery, visitorId: string) {
  return api("/queue/leave", {
    method: "POST",
    body: { train: q.train, from: q.from, date: q.date, visitorId },
  });
}
