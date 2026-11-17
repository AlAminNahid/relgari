import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/generated/prisma/client.js';
import {
  COACH_LAYOUT,
  STATIONS,
  TRAINS,
  coachesFor,
  quotasForTrain,
  toMinute,
} from './data.js';
import { AC } from '../../src/shared/constants/ac.constants.js';

try {
  process.loadEnvFile('.env');
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set.');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const stationIds = new Map<string, string>();
  for (const station of STATIONS) {
    const { id } = await prisma.station.upsert({
      where: { code: station.code },
      update: { nameEn: station.nameEn, nameBn: station.nameBn },
      create: station,
    });
    stationIds.set(station.code, id);
  }

  let seatCount = 0;
  let quotaCount = 0;
  for (const train of TRAINS) {
    const details = {
      nameEn: train.nameEn,
      nameBn: train.nameBn,
      offDay: train.offDay,
    };
    const { id: trainId } = await prisma.train.upsert({
      where: { number: train.number },
      update: details,
      create: { number: train.number, ...details },
    });

    await prisma.$transaction([
      prisma.trainStop.deleteMany({ where: { trainId } }),
      prisma.trainStop.createMany({
        data: train.stops.map((stop, index) => {
          const stationId = stationIds.get(stop.station);
          if (!stationId) throw new Error(`Unknown station ${stop.station}`);
          return {
            trainId,
            stationId,
            sequence: index + 1,
            arrivalMinute: toMinute(stop.arrive),
            departureMinute: toMinute(stop.depart),
            distanceKm: stop.km,
          };
        }),
      }),
    ]);

    const coaches = coachesFor(train);
    await prisma.coach.deleteMany({
      where: { trainId, code: { notIn: coaches.map((c) => c.code) } },
    });
    for (const [index, coach] of coaches.entries()) {
      const layout = COACH_LAYOUT[coach.seatClass];
      const fields = {
        seatClass: coach.seatClass,
        position: index + 1,
        ...layout,
      };
      const { id: coachId } = await prisma.coach.upsert({
        where: { trainId_code: { trainId, code: coach.code } },
        update: fields,
        create: { trainId, code: coach.code, ...fields },
      });
      const total = layout.rows * layout.seatsPerRow;
      const isAc = coach.seatClass === 'ac';
      const seats = Array.from({ length: total }, (_, i) => ({
        coachId,
        kind: 'seat' as const,
        number: i + 1,
        sofa: isAc ? Math.ceil((i + 1) / AC.seatsPerSofaByDay) : null,
      }));
      const berths = isAc
        ? Array.from(
            { length: layout.rows * AC.berthsPerSofaByNight },
            (_, i) => ({
              coachId,
              kind: 'berth' as const,
              number: i + 1,
              sofa: Math.ceil((i + 1) / AC.berthsPerSofaByNight),
            }),
          )
        : [];
      if (isAc) await prisma.seat.deleteMany({ where: { coachId } });
      await prisma.seat.createMany({
        data: [...seats, ...berths],
        skipDuplicates: true,
      });
      await prisma.seat.deleteMany({
        where: { coachId, kind: 'seat', number: { gt: total } },
      });
      seatCount += seats.length + berths.length;

      if (coach.seatClass === 'ac') {
        await prisma.cabin.deleteMany({ where: { coachId } });
        await prisma.cabin.createMany({
          data: AC.cabins.map((sofas, i) => ({
            coachId,
            number: i + 1,
            sofas,
          })),
        });
      }
    }

    const quotaRows = quotasForTrain(train).map((quota) => ({
      trainId,
      stationId: stationIds.get(quota.station)!,
      seatClass: quota.seatClass,
      seats: quota.seats,
    }));
    await prisma.$transaction([
      prisma.stationQuota.deleteMany({ where: { trainId } }),
      prisma.stationQuota.createMany({ data: quotaRows }),
    ]);
    quotaCount += quotaRows.length;
  }

  await prisma.train.deleteMany({
    where: { number: { notIn: TRAINS.map((t) => t.number) } },
  });
  await prisma.station.deleteMany({
    where: { code: { notIn: STATIONS.map((s) => s.code) } },
  });

  console.log(
    `Seeded ${STATIONS.length} stations, ${TRAINS.length} trains, ${seatCount} seats and ${quotaCount} station quotas.`,
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
