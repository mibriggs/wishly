ALTER TABLE "sessions" RENAME COLUMN "expires_at" TO "deleted_at";--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "secret_hash" "bytea" NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "created_at" timestamp (6) with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "last_activity_at" timestamp (6) with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "github_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "github_username" varchar(255);