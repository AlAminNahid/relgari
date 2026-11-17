-- CreateTable
CREATE TABLE "station_quotas" (
    "id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "seat_class" "seat_class" NOT NULL,
    "seats" INTEGER NOT NULL,

    CONSTRAINT "station_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "station_quotas_station_id_idx" ON "station_quotas"("station_id");

-- CreateIndex
CREATE UNIQUE INDEX "station_quotas_train_id_station_id_seat_class_key" ON "station_quotas"("train_id", "station_id", "seat_class");

-- AddForeignKey
ALTER TABLE "station_quotas" ADD CONSTRAINT "station_quotas_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "station_quotas" ADD CONSTRAINT "station_quotas_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
