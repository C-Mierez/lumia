ALTER TABLE "comment_reactions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "comment_reactions" CASCADE;--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_pk";--> statement-breakpoint
ALTER TABLE "comments" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;