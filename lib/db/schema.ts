import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const EDITION_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

function timestampColumn(columnName: string) {
  return integer(columnName, { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());
}

export const editions = sqliteTable("editions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  month: text("month").notNull(),
  year: text("year").notNull(),
  summary: text("summary"),
  coverImageUrl: text("cover_image_url"),
  status: text("status", { enum: [EDITION_STATUS.DRAFT, EDITION_STATUS.PUBLISHED] })
    .notNull()
    .default(EDITION_STATUS.DRAFT),
  createdAt: timestampColumn("created_at"),
  updatedAt: timestampColumn("updated_at").$onUpdate(() => new Date()),
});

export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  editionId: text("edition_id")
    .notNull()
    .references(() => editions.id, { onDelete: "cascade" }),
  pageNumber: integer("page_number").notNull(),
  fabricJson: text("fabric_json"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestampColumn("created_at"),
  updatedAt: timestampColumn("updated_at").$onUpdate(() => new Date()),
});

export const images = sqliteTable("images", {
  id: text("id").primaryKey(),
  editionId: text("edition_id")
    .notNull()
    .references(() => editions.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  originalFilename: text("original_filename"),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestampColumn("created_at"),
});

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestampColumn("created_at"),
});

export const editionsRelations = relations(editions, ({ many }) => ({
  pages: many(pages),
  images: many(images),
}));

export const pagesRelations = relations(pages, ({ one }) => ({
  edition: one(editions, {
    fields: [pages.editionId],
    references: [editions.id],
  }),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  edition: one(editions, {
    fields: [images.editionId],
    references: [editions.id],
  }),
}));

export const adminUsersRelations = relations(adminUsers, () => ({}));
