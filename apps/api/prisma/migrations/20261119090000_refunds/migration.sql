-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "payment_method" "payment_method" NOT NULL,
    "fee_percent" INTEGER NOT NULL,
    "fare_total" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_seats" (
    "id" TEXT NOT NULL,
    "refund_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "coach" TEXT NOT NULL,
    "seat_class" "seat_class" NOT NULL,
    "fare" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "refund" INTEGER NOT NULL,

    CONSTRAINT "refund_seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refunds_reference_key" ON "refunds"("reference");

-- CreateIndex
CREATE INDEX "refunds_booking_id_idx" ON "refunds"("booking_id");

-- CreateIndex
CREATE INDEX "refund_seats_refund_id_idx" ON "refund_seats"("refund_id");

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_seats" ADD CONSTRAINT "refund_seats_refund_id_fkey" FOREIGN KEY ("refund_id") REFERENCES "refunds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

