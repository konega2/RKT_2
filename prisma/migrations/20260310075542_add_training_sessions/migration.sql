-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "maxPilots" INTEGER NOT NULL DEFAULT 6,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingAssignment" (
    "id" TEXT NOT NULL,
    "pilotId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "TrainingAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingSession_time_idx" ON "TrainingSession"("time");

-- CreateIndex
CREATE INDEX "TrainingAssignment_pilotId_idx" ON "TrainingAssignment"("pilotId");

-- CreateIndex
CREATE INDEX "TrainingAssignment_sessionId_idx" ON "TrainingAssignment"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingAssignment_pilotId_sessionId_key" ON "TrainingAssignment"("pilotId", "sessionId");

-- AddForeignKey
ALTER TABLE "TrainingAssignment" ADD CONSTRAINT "TrainingAssignment_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAssignment" ADD CONSTRAINT "TrainingAssignment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
