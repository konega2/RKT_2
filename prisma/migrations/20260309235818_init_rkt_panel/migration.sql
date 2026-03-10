-- CreateTable
CREATE TABLE "Pilot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "dni" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "photo" TEXT,
    "internalNotes" TEXT NOT NULL DEFAULT '',
    "insuranceAccepted" BOOLEAN NOT NULL DEFAULT false,
    "liabilitySigned" BOOLEAN NOT NULL DEFAULT false,
    "imageAccepted" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT NOT NULL DEFAULT 'Panel RKT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pilot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pilotId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pilot_name_idx" ON "Pilot"("name");

-- CreateIndex
CREATE INDEX "Pilot_category_idx" ON "Pilot"("category");

-- CreateIndex
CREATE INDEX "Pilot_status_idx" ON "Pilot"("status");

-- CreateIndex
CREATE INDEX "Pilot_createdAt_idx" ON "Pilot"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_pilotId_idx" ON "Comment"("pilotId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
