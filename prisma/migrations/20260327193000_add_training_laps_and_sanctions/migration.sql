-- CreateEnum
CREATE TYPE "TrainingSanctionType" AS ENUM ('time_penalty', 'lap_deleted');

-- CreateTable
CREATE TABLE "TrainingLap" (
    "id" TEXT NOT NULL,
    "pilotId" TEXT NOT NULL,
    "pilotName" TEXT NOT NULL,
    "kart" TEXT NOT NULL,
    "tiempo" DOUBLE PRECISION NOT NULL,
    "lapNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "TrainingLap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSanction" (
    "id" TEXT NOT NULL,
    "pilotId" TEXT NOT NULL,
    "tipo" "TrainingSanctionType" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vueltas" INTEGER[],
    "motivo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "TrainingSanction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingLap_sessionId_idx" ON "TrainingLap"("sessionId");

-- CreateIndex
CREATE INDEX "TrainingLap_pilotId_idx" ON "TrainingLap"("pilotId");

-- CreateIndex
CREATE INDEX "TrainingLap_lapNumber_idx" ON "TrainingLap"("lapNumber");

-- CreateIndex
CREATE INDEX "TrainingLap_createdAt_idx" ON "TrainingLap"("createdAt");

-- CreateIndex
CREATE INDEX "TrainingSanction_sessionId_idx" ON "TrainingSanction"("sessionId");

-- CreateIndex
CREATE INDEX "TrainingSanction_pilotId_idx" ON "TrainingSanction"("pilotId");

-- CreateIndex
CREATE INDEX "TrainingSanction_createdAt_idx" ON "TrainingSanction"("createdAt");

-- AddForeignKey
ALTER TABLE "TrainingLap" ADD CONSTRAINT "TrainingLap_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingLap" ADD CONSTRAINT "TrainingLap_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSanction" ADD CONSTRAINT "TrainingSanction_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSanction" ADD CONSTRAINT "TrainingSanction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
