import type { ClassKey } from "@/config/site";
import type { Hold, SeatMap } from "@/types/api";
import { api } from "@/services/http";

export interface SeatQuery {
  train: number;
  from: string;
  to: string;
  date: string;
  cls: ClassKey;
}

export function getSeatMap(q: SeatQuery) {
  const query = new URLSearchParams({
    from: q.from,
    to: q.to,
    date: q.date,
    class: q.cls,
  });
  return api<SeatMap>(`/trains/${q.train}/seats?${query}`);
}

export function listHolds() {
  return api<Hold[]>("/holds/current");
}

export function holdSeat(q: SeatQuery, seatId: string) {
  return api<Hold>("/holds", {
    method: "POST",
    body: { train: q.train, from: q.from, to: q.to, date: q.date, seatId },
  });
}

export function releaseHold(id: string) {
  return api(`/holds/${id}`, { method: "DELETE" });
}
