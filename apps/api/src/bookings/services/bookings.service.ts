import { randomInt } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PaymentMethod, User } from '../../generated/prisma/client.js';
import { HoldsService } from '../../holds/services/holds.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { HOLD } from '../../shared/constants/hold.constants.js';
import { PAYMENT } from '../../shared/constants/payment.constants.js';
import type { ApiError, ApiErrorCode } from '../../shared/types/api.types.js';
import { addDays } from '../../shared/utils/bd-time.js';
import { seatLabel } from '../../trains/services/seat-class.js';
import type {
  BookingDto,
  CheckoutDto,
  PayBookingDto,
} from '../dto/booking.dto.js';
import { PaymentService } from './payment.service.js';

const fail = (code: ApiErrorCode) => ({ code }) satisfies ApiError;
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const PAD = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomCode = (length: number) =>
  Array.from({ length }, () => PAD[randomInt(PAD.length)]).join('');

const TRANSACTION_PREFIX: Record<PaymentMethod, string> = {
  bkash: 'BK',
  nagad: 'NG',
  rocket: 'RK',
  card: 'CD',
};

function clock(minute: number): string {
  const inDay = minute % 1440;
  const hours = String(Math.floor(inDay / 60)).padStart(2, '0');
  return `${hours}:${String(inDay % 60).padStart(2, '0')}`;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly holds: HoldsService,
    private readonly payment: PaymentService,
  ) {}

  async checkout(userId: string, now: Date): Promise<CheckoutDto> {
    const live = await this.prisma.hold.findMany({
      where: { userId, expiresAt: { gt: now } },
      select: { id: true },
    });
    const until = new Date(now.getTime() + HOLD.checkoutMinutes * 60_000);
    await this.prisma.hold.updateMany({
      where: { id: { in: live.map((h) => h.id) }, expiresAt: { lt: until } },
      data: { expiresAt: until },
    });

    const holds = await this.holds.list(userId, now);
    const subtotal = holds.reduce((sum, hold) => sum + hold.fare, 0);
    const serviceCharge = holds.length * PAYMENT.serviceChargePerSeat;
    return { holds, subtotal, serviceCharge, total: subtotal + serviceCharge };
  }

  async create(
    user: User,
    input: PayBookingDto,
    now: Date,
  ): Promise<BookingDto> {
    const before = await this.prisma.hold.count({
      where: { userId: user.id, expiresAt: { gt: now } },
    });
    if (before === 0) throw new BadRequestException(fail('HOLDS_EMPTY'));

    this.payment.charge(input, now);

    let bookingId: string;
    try {
      bookingId = await this.prisma.$transaction(async (tx) => {
        const holds = await tx.hold.findMany({
          where: { userId: user.id, expiresAt: { gt: now } },
        });
        if (holds.length === 0) {
          throw new BadRequestException(fail('HOLDS_EMPTY'));
        }
        const first = holds[0];
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${first.trainId}:${isoDate(first.runDate)}`}, 0))`;

        const subtotal = holds.reduce((sum, hold) => sum + hold.fare, 0);
        const serviceCharge = holds.length * PAYMENT.serviceChargePerSeat;
        const booking = await tx.booking.create({
          data: {
            pnr: `RG${randomCode(6)}`,
            userId: user.id,
            trainId: first.trainId,
            runDate: first.runDate,
            fromStationId: first.fromStationId,
            toStationId: first.toStationId,
            paymentMethod: input.method,
            transactionId: `${TRANSACTION_PREFIX[input.method]}${randomCode(10)}`,
            subtotal,
            serviceCharge,
            total: subtotal + serviceCharge,
            seats: {
              create: holds.map((hold) => ({
                seatId: hold.seatId,
                trainId: hold.trainId,
                runDate: hold.runDate,
                seatClass: hold.seatClass,
                fromStationId: hold.fromStationId,
                fare: hold.fare,
              })),
            },
          },
        });
        await tx.hold.deleteMany({
          where: { id: { in: holds.map((h) => h.id) } },
        });
        return booking.id;
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(fail('SEAT_TAKEN'));
      }
      throw error;
    }
    return this.get(user.id, bookingId);
  }

  async get(userId: string, id: string): Promise<BookingDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id, userId },
      include: {
        user: true,
        fromStation: true,
        toStation: true,
        train: {
          include: { stops: true },
        },
        seats: { include: { seat: { include: { coach: true } } } },
      },
    });
    if (!booking) throw new NotFoundException(fail('BOOKING_NOT_FOUND'));

    const board = booking.train.stops.find(
      (stop) => stop.stationId === booking.fromStationId,
    );
    const leave = booking.train.stops.find(
      (stop) => stop.stationId === booking.toStationId,
    );
    const departs = board?.departureMinute ?? board?.arrivalMinute ?? 0;
    const arrives = leave?.arrivalMinute ?? leave?.departureMinute ?? 0;
    const station = (s: { code: string; nameEn: string; nameBn: string }) => ({
      code: s.code,
      nameEn: s.nameEn,
      nameBn: s.nameBn,
    });

    return {
      id: booking.id,
      pnr: booking.pnr,
      train: {
        number: booking.train.number,
        nameEn: booking.train.nameEn,
        nameBn: booking.train.nameBn,
      },
      from: station(booking.fromStation),
      to: station(booking.toStation),
      date: addDays(isoDate(booking.runDate), Math.floor(departs / 1440)),
      departure: clock(departs),
      arrival: clock(arrives),
      arrivalDayOffset: Math.floor(arrives / 1440) - Math.floor(departs / 1440),
      passenger: { name: booking.user.name, phone: booking.user.phone },
      seats: booking.seats
        .map((row) => ({
          id: row.seatId,
          label: seatLabel(row.seat, row.seat.coach.code),
          coach: row.seat.coach.code,
          seatClass: row.seatClass as Exclude<typeof row.seatClass, 'shovan'>,
          fare: row.fare,
          position: row.seat.coach.position * 1000 + row.seat.number,
        }))
        .sort((a, b) => a.position - b.position)
        .map(({ position: _position, ...seat }) => seat),
      subtotal: booking.subtotal,
      serviceCharge: booking.serviceCharge,
      total: booking.total,
      paymentMethod: booking.paymentMethod,
      transactionId: booking.transactionId,
      paidAt: booking.createdAt.toISOString(),
    };
  }
}
