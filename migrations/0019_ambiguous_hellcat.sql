CREATE TABLE "email_verification_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp (6) with time zone,
	CONSTRAINT "email_verification_requests_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "password_reset_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"two_factor_verified" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp (6) with time zone,
	CONSTRAINT "password_reset_session_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "email_verification_requests" ADD CONSTRAINT "email_verification_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_session" ADD CONSTRAINT "password_reset_session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;