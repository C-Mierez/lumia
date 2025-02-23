ALTER TABLE "views" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "views" ADD COLUMN "watched_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "views" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "views" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "views" DROP CONSTRAINT "views_pk";
--> statement-breakpoint
ALTER TABLE "views" ADD CONSTRAINT "views_pk" PRIMARY KEY("user_id","video_id","watched_at");