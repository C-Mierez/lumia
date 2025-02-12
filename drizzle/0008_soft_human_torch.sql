CREATE TYPE "public"."video_visibility" AS ENUM('public', 'private');--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "visibility" "video_visibility" DEFAULT 'private' NOT NULL;