import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

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

export const videosTable = pgTable("videos", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    /* --------------------------------- Foreign -------------------------------- */
    userId: uuid("user_id")
        .references(() => usersTable.id, { onDelete: "cascade" })
        .notNull(),
    categoryId: uuid("category_id").references(() => categoriesTable.id, {
        onDelete: "set null",
    }),
});
