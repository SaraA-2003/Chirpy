CREATE TABLE "chirps" (
	"id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"body" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chirps" ADD CONSTRAINT "chirps_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;