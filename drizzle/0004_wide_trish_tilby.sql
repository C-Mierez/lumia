ALTER TABLE "videos" ADD COLUMN "mux_status" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_asset_id" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_upload_id" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_playback_id" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_track_id" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_track_status" text;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_mux_asset_id_unique" UNIQUE("mux_asset_id");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_mux_upload_id_unique" UNIQUE("mux_upload_id");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_mux_playback_id_unique" UNIQUE("mux_playback_id");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_mux_track_id_unique" UNIQUE("mux_track_id");