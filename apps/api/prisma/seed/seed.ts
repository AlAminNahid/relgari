import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/generated/prisma/client.js';
import { COACH_LAYOUT, STATIONS, TRAINS, coachesFor } from './data.js';

try {
  process.loadEnvFile('.env');
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set.');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function toMinute(time: string | undefined): number | null {
  if (!time) return null;
  const [clock, nextDay] = time.split('+');
  const [hours, minutes] = clock.split(':').map(Number);
  return (nextDay ? Number(nextDay) * 1440 : 0) + hours * 60 + minutes;
}

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
      await prisma.seat.createMany({
        data: Array.from({ length: total }, (_, i) => ({
          coachId,
          number: i + 1,
        })),
        skipDuplicates: true,
      });
      await prisma.seat.deleteMany({
        where: { coachId, number: { gt: total } },
      });
      seatCount += total;
    }
    await prisma.coach.deleteMany({
      where: { trainId, code: { notIn: coaches.map((c) => c.code) } },
    });
  }

  await prisma.train.deleteMany({
    where: { number: { notIn: TRAINS.map((t) => t.number) } },
  });
  await prisma.station.deleteMany({
    where: { code: { notIn: STATIONS.map((s) => s.code) } },
  });

  console.log(
    `Seeded ${STATIONS.length} stations, ${TRAINS.length} trains and ${seatCount} seats.`,
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
