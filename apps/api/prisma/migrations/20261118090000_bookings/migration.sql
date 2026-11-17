-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('bkash', 'nagad', 'rocket', 'card');

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "pnr" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "run_date" DATE NOT NULL,
    "from_station_id" TEXT NOT NULL,
    "to_station_id" TEXT NOT NULL,
    "payment_method" "payment_method" NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "service_charge" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_seats" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "seat_id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "run_date" DATE NOT NULL,
    "seat_class" "seat_class" NOT NULL,
    "from_station_id" TEXT NOT NULL,
    "fare" INTEGER NOT NULL,

    CONSTRAINT "booking_seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_pnr_key" ON "bookings"("pnr");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_transaction_id_key" ON "bookings"("transaction_id");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "booking_seats_train_id_run_date_idx" ON "booking_seats"("train_id", "run_date");

-- CreateIndex
CREATE INDEX "booking_seats_booking_id_idx" ON "booking_seats"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_seats_seat_id_run_date_key" ON "booking_seats"("seat_id", "run_date");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_from_station_id_fkey" FOREIGN KEY ("from_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_to_station_id_fkey" FOREIGN KEY ("to_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_seats" ADD CONSTRAINT "booking_seats_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_seats" ADD CONSTRAINT "booking_seats_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

