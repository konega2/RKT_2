ALTER TABLE "TrainingSession" ALTER COLUMN "maxPilots" SET DEFAULT 24;

UPDATE "TrainingSession"
SET "maxPilots" = 24;