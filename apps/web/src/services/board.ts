import type { DepartureBoard } from "@/types/api";
import { api } from "@/services/http";

export function getBoard(code: string) {
  return api<DepartureBoard>(`/trains/board?station=${code}&limit=6`);
}
