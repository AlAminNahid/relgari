import { Injectable } from '@nestjs/common';
import { queueSettings } from '../../shared/constants/queue.constants.js';

export interface QueueStatus {
  state: 'admitted' | 'waiting';
  position: number | null;
  waiting: number;
  capacity: number;
  etaSeconds: number | null;
}

interface Room {
  active: Map<string, number>;
  waiting: { id: string; seen: number }[];
  admissions: number[];
}

@Injectable()
export class QueueService {
  private readonly rooms = new Map<string, Room>();

  join(
    key: string,
    id: string,
    priority: boolean,
    now = Date.now(),
  ): QueueStatus {
    const room = this.room(key);
    this.tidy(room, now);

    if (room.active.has(id)) {
      room.active.set(id, now);
      return this.status(room, id, now);
    }
    const waiting = room.waiting.find((entry) => entry.id === id);
    if (waiting) {
      waiting.seen = now;
      this.promote(room, now);
      return this.status(room, id, now);
    }
    const { capacity } = queueSettings();
    if (priority) {
      this.admit(room, id, now);
    } else if (room.active.size < capacity && room.waiting.length === 0) {
      this.admit(room, id, now);
    } else {
      room.waiting.push({ id, seen: now });
      this.promote(room, now);
    }
    return this.status(room, id, now);
  }

  leave(key: string, id: string, now = Date.now()): void {
    const room = this.rooms.get(key);
    if (!room) return;
    room.active.delete(id);
    room.waiting = room.waiting.filter((entry) => entry.id !== id);
    this.promote(room, now);
    if (room.active.size === 0 && room.waiting.length === 0) {
      this.rooms.delete(key);
    }
  }

  sweep(now = Date.now()): void {
    for (const [key, room] of this.rooms) {
      this.tidy(room, now);
      if (room.active.size === 0 && room.waiting.length === 0) {
        this.rooms.delete(key);
      }
    }
  }

  size(): number {
    return this.rooms.size;
  }

  private room(key: string): Room {
    let room = this.rooms.get(key);
    if (!room) {
      room = { active: new Map(), waiting: [], admissions: [] };
      this.rooms.set(key, room);
    }
    return room;
  }

  private tidy(room: Room, now: number): void {
    const { activeIdleMs, waitingGraceMs } = queueSettings();
    for (const [id, seen] of room.active) {
      if (now - seen > activeIdleMs) room.active.delete(id);
    }
    room.waiting = room.waiting.filter(
      (entry) => now - entry.seen <= waitingGraceMs,
    );
    room.admissions = room.admissions.filter((at) => now - at <= 60_000);
    this.promote(room, now);
  }

  private admit(room: Room, id: string, now: number): void {
    room.active.set(id, now);
    room.admissions.push(now);
  }

  private promote(room: Room, now: number): void {
    const { capacity } = queueSettings();
    while (room.active.size < capacity && room.waiting.length > 0) {
      const next = room.waiting.shift();
      if (next) this.admit(room, next.id, now);
    }
  }

  private status(room: Room, id: string, now: number): QueueStatus {
    const { capacity } = queueSettings();
    if (room.active.has(id)) {
      return {
        state: 'admitted',
        position: null,
        waiting: room.waiting.length,
        capacity,
        etaSeconds: null,
      };
    }
    const position = room.waiting.findIndex((entry) => entry.id === id) + 1;
    const recent = room.admissions.filter((at) => now - at <= 60_000).length;
    const perSecond = recent > 0 ? recent / 60 : 0.1;
    return {
      state: 'waiting',
      position,
      waiting: room.waiting.length,
      capacity,
      etaSeconds: Math.max(3, Math.ceil(position / perSecond)),
    };
  }
}
