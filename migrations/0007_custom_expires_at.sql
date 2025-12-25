-- Custom SQL migration file, put your code below! --

-- Backfill expires_at for existing rows where it's null and duration_type is 'THIRTY_DAYS'
-- Set expires_at to 30 days after updated_at
UPDATE "shared_wishlists"
SET "expires_at" = "updated_at" + INTERVAL '30 days'
WHERE "expires_at" IS NULL
  AND "duration_type" = 'THIRTY_DAYS';
