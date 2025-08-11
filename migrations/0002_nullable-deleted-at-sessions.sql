-- Custom SQL migration file, put your code below! --
ALTER TABLE IF EXISTS "sessions"
ALTER COLUMN "deleted_at" DROP NOT NULL;