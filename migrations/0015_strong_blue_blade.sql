ALTER TABLE "sessions" ADD COLUMN "two_factor_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "totp_key" "bytea";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "recovery_code" "bytea";--> statement-breakpoint
CREATE INDEX "email_index" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "github_username";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "google_username";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "discord_username";