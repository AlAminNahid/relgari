-- CreateEnum
CREATE TYPE "seat_kind" AS ENUM ('seat', 'berth');

-- DropIndex
DROP INDEX "seats_coach_id_number_key";

-- AlterTable
ALTER TABLE "seats" ADD COLUMN     "kind" "seat_kind" NOT NULL DEFAULT 'seat',
ADD COLUMN     "sofa" INTEGER;

-- CreateTable
CREATE TABLE "holds" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "run_date" DATE NOT NULL,
    "seat_id" TEXT NOT NULL,
    "seat_class" "seat_class" NOT NULL,
    "from_station_id" TEXT NOT NULL,
    "to_station_id" TEXT NOT NULL,
    "fare" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "holds_user_id_idx" ON "holds"("user_id");

-- CreateIndex
CREATE INDEX "holds_train_id_run_date_idx" ON "holds"("train_id", "run_date");

-- CreateIndex
CREATE INDEX "holds_expires_at_idx" ON "holds"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "holds_seat_id_run_date_key" ON "holds"("seat_id", "run_date");

-- CreateIndex
CREATE UNIQUE INDEX "seats_coach_id_kind_number_key" ON "seats"("coach_id", "kind", "number");

-- AddForeignKey
ALTER TABLE "holds" ADD CONSTRAINT "holds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holds" ADD CONSTRAINT "holds_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holds" ADD CONSTRAINT "holds_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holds" ADD CONSTRAINT "holds_from_station_id_fkey" FOREIGN KEY ("from_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holds" ADD CONSTRAINT "holds_to_station_id_fkey" FOREIGN KEY ("to_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

