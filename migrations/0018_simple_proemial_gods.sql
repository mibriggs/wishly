DROP INDEX "discord_id_index";--> statement-breakpoint
DROP INDEX "github_id_index";--> statement-breakpoint
CREATE INDEX "oauth_id_index" ON "users" USING btree ("oauth_id");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "github_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "google_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "discord_id";