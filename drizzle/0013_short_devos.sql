ALTER TABLE "views" DROP CONSTRAINT "views_pk";
--> statement-breakpoint
ALTER TABLE "views" ADD CONSTRAINT "views_pk" PRIMARY KEY("video_id","watched_at");