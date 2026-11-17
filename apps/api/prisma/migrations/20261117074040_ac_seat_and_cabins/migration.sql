-- AlterEnum
ALTER TYPE "seat_class" ADD VALUE 'acs';

-- CreateTable
CREATE TABLE "cabins" (
    "id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "sofas" INTEGER NOT NULL,

    CONSTRAINT "cabins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cabins_coach_id_number_key" ON "cabins"("coach_id", "number");

-- AddForeignKey
ALTER TABLE "cabins" ADD CONSTRAINT "cabins_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
