DROP INDEX IF EXISTS "Pilot_category_idx";

ALTER TABLE "Pilot"
  ALTER COLUMN "category" TYPE TEXT[]
  USING ARRAY["category"];
