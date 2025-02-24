CREATE TABLE "comment_reactions" (
	"reactionType" "reaction_type" NOT NULL,
	"reacted_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"comment_id" integer NOT NULL,
	"video_id" uuid NOT NULL,
	CONSTRAINT "comment_reactions_pk" PRIMARY KEY("user_id","comment_id"),
	CONSTRAINT "comment_reactions_comment_id_unique" UNIQUE("comment_id"),
	CONSTRAINT "comment_reactions_video_id_unique" UNIQUE("video_id")
);
--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_comment_id_fk" FOREIGN KEY ("comment_id","video_id") REFERENCES "public"."comments"("id","video_id") ON DELETE no action ON UPDATE no action;