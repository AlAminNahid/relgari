import { randomInt } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  PaymentMethod,
  Prisma,
  SeatClass,
  User,
} from '../../generated/prisma/client.js';
import { HoldsService } from '../../holds/services/holds.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PURCHASE_LIMIT } from '../../shared/constants/limits.constants.js';
import { feePercentFor } from '../../shared/constants/cancellation.constants.js';
import { HOLD } from '../../shared/constants/hold.constants.js';
import { PAYMENT } from '../../shared/constants/payment.constants.js';
import type { ApiError, ApiErrorCode } from '../../shared/types/api.types.js';
import { addDays, bdMonthRange, bdMoment } from '../../shared/utils/bd-time.js';
import { seatLabel } from '../../trains/services/seat-class.js';
import type {
  BookingDto,
  BookingStatus,
  CheckoutDto,
  LimitDto,
  PayBookingDto,
  QuoteDto,
  RefundDto,
  VerifyDto,
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
    const usage = await this.monthlyUsage(user.id, now);
    if (usage.used + before > usage.max) {
      throw new ConflictException(fail('MONTHLY_LIMIT'));
    }

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

  async monthlyUsage(userId: string, now: Date): Promise<LimitDto> {
    const { start, end, resetsOn } = bdMonthRange(now);
    const used = await this.prisma.bookingSeat.count({
      where: { booking: { userId, createdAt: { gte: start, lt: end } } },
    });
    const max = PURCHASE_LIMIT.seatsPerMonth;
    return { used, max, remaining: Math.max(0, max - used), resetsOn };
  }

  async verify(pnr: string, now: Date): Promise<VerifyDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { pnr },
      include: bookingInclude,
    });
    if (!booking) throw new NotFoundException(fail('BOOKING_NOT_FOUND'));
    const ticket = this.toDto(booking, now);
    const initials = ticket.passenger.name
      .trim()
      .split(/\s+/)
      .map((word) => `${Array.from(word)[0] ?? ''}***`)
      .join(' ');
    return {
      pnr: ticket.pnr,
      status: ticket.status,
      valid:
        ticket.status === 'confirmed' || ticket.status === 'partly_cancelled',
      train: ticket.train,
      from: ticket.from,
      to: ticket.to,
      date: ticket.date,
      departure: ticket.departure,
      passenger: initials,
      seats: ticket.seats.map((seat) => ({
        label: seat.label,
        coach: seat.coach,
        seatClass: seat.seatClass,
      })),
    };
  }

  async list(userId: string, now: Date): Promise<BookingDto[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: [{ runDate: 'desc' }, { createdAt: 'desc' }],
    });
    return bookings.map((booking) => this.toDto(booking, now));
  }

  async get(userId: string, id: string): Promise<BookingDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id, userId },
      include: bookingInclude,
    });
    if (!booking) throw new NotFoundException(fail('BOOKING_NOT_FOUND'));
    return this.toDto(booking, new Date());
  }

  async quote(
    userId: string,
    id: string,
    seatIds: string[],
    now: Date,
  ): Promise<QuoteDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id, userId },
      include: bookingInclude,
    });
    if (!booking) throw new NotFoundException(fail('BOOKING_NOT_FOUND'));
    return this.priceCancellation(booking, seatIds, now);
  }

  async cancel(
    userId: string,
    id: string,
    seatIds: string[],
    now: Date,
  ): Promise<RefundDto> {
    const refundId = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id, userId },
        include: bookingInclude,
      });
      if (!booking) throw new NotFoundException(fail('BOOKING_NOT_FOUND'));
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${booking.trainId}:${isoDate(booking.runDate)}`}, 0))`;

      const quote = this.priceCancellation(booking, seatIds, now);
      const refund = await tx.refund.create({
        data: {
          reference: `RF${randomCode(8)}`,
          bookingId: booking.id,
          paymentMethod: booking.paymentMethod,
          feePercent: quote.feePercent,
          fareTotal: quote.fareTotal,
          fee: quote.fee,
          amount: quote.amount,
          seats: {
            create: quote.seats.map((seat) => ({
              label: seat.label,
              coach: seat.coach,
              seatClass: seat.seatClass,
              fare: seat.fare,
              fee: seat.fee,
              refund: seat.refund,
            })),
          },
        },
      });
      await tx.bookingSeat.deleteMany({
        where: { bookingId: booking.id, seatId: { in: seatIds } },
      });
      return refund.id;
    });

    const refund = await this.prisma.refund.findUniqueOrThrow({
      where: { id: refundId },
      include: { seats: true },
    });
    return this.refundDto(refund);
  }

  private priceCancellation(
    booking: BookingRecord,
    seatIds: string[],
    now: Date,
  ): QuoteDto {
    const departureAt = this.departureAt(booking);
    const hoursLeft = (departureAt.getTime() - now.getTime()) / 3_600_000;
    const feePercent = feePercentFor(hoursLeft);
    if (feePercent === null)
      throw new BadRequestException(fail('CANCEL_CLOSED'));

    const unique = [...new Set(seatIds)];
    const rows = unique.map((seatId) =>
      booking.seats.find((row) => row.seatId === seatId),
    );
    if (rows.length === 0 || rows.some((row) => !row)) {
      throw new NotFoundException(fail('SEAT_NOT_FOUND'));
    }
    const seats = (rows as typeof booking.seats).map((row) => {
      const fee = Math.round((row.fare * feePercent) / 100);
      return {
        id: row.seatId,
        label: seatLabel(row.seat, row.seat.coach.code),
        coach: row.seat.coach.code,
        seatClass: row.seatClass as Exclude<typeof row.seatClass, 'shovan'>,
        fare: row.fare,
        fee,
        refund: row.fare - fee,
      };
    });
    const fareTotal = seats.reduce((sum, seat) => sum + seat.fare, 0);
    const fee = seats.reduce((sum, seat) => sum + seat.fee, 0);
    return {
      feePercent,
      fareTotal,
      fee,
      amount: fareTotal - fee,
      paymentMethod: booking.paymentMethod,
      seats,
    };
  }

  private departureAt(booking: BookingRecord): Date {
    const board = booking.train.stops.find(
      (stop) => stop.stationId === booking.fromStationId,
    );
    const departs = board?.departureMinute ?? board?.arrivalMinute ?? 0;
    const boardingDate = addDays(
      isoDate(booking.runDate),
      Math.floor(departs / 1440),
    );
    return bdMoment(boardingDate, departs % 1440);
  }

  private refundDto(refund: {
    reference: string;
    paymentMethod: PaymentMethod;
    feePercent: number;
    fareTotal: number;
    fee: number;
    amount: number;
    createdAt: Date;
    seats: {
      label: string;
      coach: string;
      seatClass: SeatClass;
      fare: number;
      fee: number;
      refund: number;
    }[];
  }): RefundDto {
    return {
      reference: refund.reference,
      paymentMethod: refund.paymentMethod,
      feePercent: refund.feePercent,
      fareTotal: refund.fareTotal,
      fee: refund.fee,
      amount: refund.amount,
      createdAt: refund.createdAt.toISOString(),
      seats: refund.seats.map((seat) => ({
        label: seat.label,
        coach: seat.coach,
        seatClass: seat.seatClass as Exclude<SeatClass, 'shovan'>,
        fare: seat.fare,
        fee: seat.fee,
        refund: seat.refund,
      })),
    };
  }

  private toDto(booking: BookingRecord, now: Date): BookingDto {
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

    const departureAt = this.departureAt(booking);
    const departed = departureAt <= now;
    const feePercent = departed
      ? null
      : feePercentFor((departureAt.getTime() - now.getTime()) / 3_600_000);
    const hasSeats = booking.seats.length > 0;
    let status: BookingStatus = 'confirmed';
    if (!hasSeats) status = 'cancelled';
    else if (departed) status = 'departed';
    else if (booking.refunds.length > 0) status = 'partly_cancelled';

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
      status,
      departureAt: departureAt.toISOString(),
      canCancel: hasSeats && feePercent !== null,
      cancelFeePercent: hasSeats ? feePercent : null,
      refunds: booking.refunds
        .slice()
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((refund) => this.refundDto(refund)),
    };
  }
}

const bookingInclude = {
  user: true,
  fromStation: true,
  toStation: true,
  train: { include: { stops: true } },
  seats: { include: { seat: { include: { coach: true } } } },
  refunds: { include: { seats: true } },
} satisfies Prisma.BookingInclude;

type BookingRecord = Prisma.BookingGetPayload<{
  include: typeof bookingInclude;
}>;
