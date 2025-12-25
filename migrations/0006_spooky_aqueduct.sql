CREATE TYPE "public"."share_duration" AS ENUM('ONE_HOUR', 'ONE_DAY', 'SEVEN_DAYS', 'FOURTEEN_DAYS', 'THIRTY_DAYS', 'NINETY_DAYS', 'NEVER');--> statement-breakpoint
DROP INDEX "one_null_date_per_fk";--> statement-breakpoint
ALTER TABLE "shared_wishlists" ADD COLUMN "expires_at" timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "shared_wishlists" ADD COLUMN "duration_type" "share_duration" DEFAULT 'THIRTY_DAYS' NOT NULL;--> statement-breakpoint
ALTER TABLE "shared_wishlists" DROP COLUMN "deleted_at";