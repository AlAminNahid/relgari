-- CreateEnum
CREATE TYPE "seat_class" AS ENUM ('shovan', 'schair', 'snigdha', 'ac');

-- CreateTable
CREATE TABLE "stations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT NOT NULL,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trains" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT NOT NULL,
    "off_day" INTEGER,

    CONSTRAINT "trains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "train_stops" (
    "id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "arrival_minute" INTEGER,
    "departure_minute" INTEGER,
    "distance_km" INTEGER NOT NULL,

    CONSTRAINT "train_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaches" (
    "id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "seat_class" "seat_class" NOT NULL,
    "position" INTEGER NOT NULL,
    "rows" INTEGER NOT NULL,
    "seats_per_row" INTEGER NOT NULL,

    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stations_code_key" ON "stations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "trains_number_key" ON "trains"("number");

-- CreateIndex
CREATE INDEX "train_stops_station_id_idx" ON "train_stops"("station_id");

-- CreateIndex
CREATE UNIQUE INDEX "train_stops_train_id_sequence_key" ON "train_stops"("train_id", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "train_stops_train_id_station_id_key" ON "train_stops"("train_id", "station_id");

-- CreateIndex
CREATE UNIQUE INDEX "coaches_train_id_code_key" ON "coaches"("train_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "coaches_train_id_position_key" ON "coaches"("train_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "seats_coach_id_number_key" ON "seats"("coach_id", "number");

-- AddForeignKey
ALTER TABLE "train_stops" ADD CONSTRAINT "train_stops_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train_stops" ADD CONSTRAINT "train_stops_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
