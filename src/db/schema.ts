import { createSelectSchema, createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/* -------------------------------- Entities -------------------------------- */
export const usersTable = pgTable(
    "users",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        clerkId: text("clerk_id").unique().notNull(),
        name: text("name").notNull(),
        imageUrl: text("image_url").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)],
);

export const categoriesTable = pgTable(
    "categories",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull().unique(),
        description: text("description"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (t) => [uniqueIndex("name_idx").on(t.name)],
);

export const videoVisibilityEnum = pgEnum("video_visibility", ["public", "private"]);

export const videosTable = pgTable("videos", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    thumbnailUrl: text("thumbnail_url"),
    previewUrl: text("preview_url"),
    duration: integer("duration"),
    visibility: videoVisibilityEnum("visibility").default("private").notNull(),
    /* ----------------------------------- Mux ---------------------------------- */
    muxStatus: text("mux_status"),
    muxAssetId: text("mux_asset_id").unique(),
    muxUploadId: text("mux_upload_id").unique(),
    muxPlaybackId: text("mux_playback_id").unique(),
    muxTrackId: text("mux_track_id").unique(),
    muxTrackStatus: text("mux_track_status"),
    /* --------------------------------- Foreign -------------------------------- */
    userId: uuid("user_id")
        .references(() => usersTable.id, { onDelete: "cascade" })
        .notNull(),
    categoryId: uuid("category_id").references(() => categoriesTable.id, {
        onDelete: "set null",
    }),
});

export const videoSelectSchema = createSelectSchema(videosTable);
export const videoInsertSchema = createInsertSchema(videosTable);
export const videoUpdateSchema = createUpdateSchema(videosTable);
