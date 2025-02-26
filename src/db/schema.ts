import {
    foreignKey,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    serial,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

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

export const videoVisibilityEnum = pgEnum("video_visibility", ["public", "private", "unlisted"]);

export const videosTable = pgTable("videos", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    thumbnailUrl: text("thumbnail_url"),
    thumbnailKey: text("thumbnail_key"),
    previewUrl: text("preview_url"),
    previewKey: text("preview_key"),
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
export const videoUpdateSchema = createUpdateSchema(videosTable).refine(
    (data) => {
        if (data.visibility === "public" && !data.muxPlaybackId) {
            return false;
        }
        return true;
    },
    {
        message: "You can't set the visibility to public until the video is processed",
        path: ["visibility"],
    },
);

// This is not the best implementation for views but it simplifies the implementation of a watch history feature
export const viewsTable = pgTable(
    "views",
    {
        watchedAt: timestamp("watched_at").defaultNow().notNull(),
        /* --------------------------------- Foreign -------------------------------- */
        userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
        videoId: uuid("video_id")
            .references(() => videosTable.id, { onDelete: "cascade" })
            .notNull(),
    },
    (t) => [primaryKey({ name: "views_pk", columns: [t.videoId, t.watchedAt] })],
);

export const viewsSelectSchema = createSelectSchema(viewsTable);
export const viewsInsertSchema = createInsertSchema(viewsTable);
export const viewsUpdateSchema = createUpdateSchema(viewsTable);

export const reactionEnum = pgEnum("reaction_type", ["like", "dislike"]);

// Similarly, this is implemented this way to simplify the implementation of a liked/disliked videos list feature
export const reactionsTable = pgTable(
    "reactions",
    {
        reactionType: reactionEnum("reactionType").notNull(),
        reactedAt: timestamp("reacted_at").defaultNow().notNull(),
        /* --------------------------------- Foreign -------------------------------- */
        userId: uuid("user_id")
            .references(() => usersTable.id, { onDelete: "cascade" })
            .notNull(),
        videoId: uuid("video_id")
            .references(() => videosTable.id, { onDelete: "cascade" })
            .notNull(),
    },
    (t) => [primaryKey({ name: "reactions_pk", columns: [t.userId, t.videoId] })],
);

export const reactionsSelectSchema = createSelectSchema(reactionsTable);
export const reactionsInsertSchema = createInsertSchema(reactionsTable);
export const reactionsUpdateSchema = createUpdateSchema(reactionsTable);

export const subscriptionsTable = pgTable(
    "subscriptions",
    {
        subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
        /* --------------------------------- Foreign -------------------------------- */
        subscriberId: uuid("subscriber_id")
            .references(() => usersTable.id, { onDelete: "cascade" })
            .notNull(),
        subscribedToId: uuid("subscribed_to_id")
            .references(() => usersTable.id, { onDelete: "cascade" })
            .notNull(),
    },
    (t) => [primaryKey({ name: "subscriptions_pk", columns: [t.subscriberId, t.subscribedToId] })],
);

export const commentsTable = pgTable(
    "comments",
    {
        id: serial("id").primaryKey(),
        text: text("text").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
        /* --------------------------------- Foreign -------------------------------- */
        userId: uuid("user_id")
            .references(() => usersTable.id, { onDelete: "cascade" })
            .notNull(),
        videoId: uuid("video_id")
            .references(() => videosTable.id, { onDelete: "cascade" })
            .notNull(),
        parentId: integer("parent_id"),
    },
    (t) => [
        foreignKey({
            name: "comments_parent_id_fk",
            columns: [t.parentId],
            foreignColumns: [t.id],
        }).onDelete("cascade"),
    ],
);

export const commentsSelectSchema = createSelectSchema(commentsTable);
export const commentsInsertSchema = createInsertSchema(commentsTable);
export const commentsUpdateSchema = createUpdateSchema(commentsTable).refine(
    (data) => {
        if (!data.text) return false;
        if (data.text && data.text.length < 1) return false;
        return true;
    },
    {
        message: "Comment must not be empty",
    },
);

export const commentReactionsTable = pgTable(
    "comment_reactions",
    {
        reactionType: reactionEnum("reactionType").notNull(),
        reactedAt: timestamp("reacted_at").defaultNow().notNull(),
        /* --------------------------------- Foreign -------------------------------- */
        userId: uuid("user_id")
            .references(() => usersTable.id, { onDelete: "cascade" })
            .notNull(),
        commentId: integer("comment_id")
            .notNull()
            .references(() => commentsTable.id, {
                onDelete: "cascade",
            }),
        videoId: uuid("video_id").notNull(),
    },
    (t) => [primaryKey({ name: "comment_reactions_pk", columns: [t.userId, t.commentId] })],
);

export const commentReactionsSelectSchema = createSelectSchema(commentReactionsTable);
export const commentReactionsInsertSchema = createInsertSchema(commentReactionsTable);
export const commentReactionsUpdateSchema = createUpdateSchema(commentReactionsTable);
