CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uuid" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "jobss" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uuid" text NOT NULL,
	"user" uuid NOT NULL,
	"result" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jobss_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "jobss" ADD CONSTRAINT "jobss_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;