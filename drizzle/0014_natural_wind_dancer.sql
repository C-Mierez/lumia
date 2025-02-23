CREATE TYPE "public"."reaction_type" AS ENUM('like', 'dislike');--> statement-breakpoint
CREATE TABLE "reactions" (
	"reactionType" "reaction_type" NOT NULL,
	"reacted_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	CONSTRAINT "reactions_pk" PRIMARY KEY("user_id","video_id")
);
--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;