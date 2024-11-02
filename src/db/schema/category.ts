import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import type { z } from "zod";
import { relations } from "drizzle-orm";
import { freeCourse } from "./free_course";
import { paidCourse } from "./paid_course";

export const category = pgTable("category", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const categoryRelations = relations(category, ({ many }) => ({
  freeCourse: many(freeCourse),
  paidCourse: many(paidCourse),
}));

export const categoryCreateSchema = createInsertSchema(category, {
  id: (schema) => schema.id.optional(),
});

export const categoryUpdateSchema = createInsertSchema(category, {
  name: (schema) => schema.name,
});

export const categorySchema = createInsertSchema(category);
export type CategorySchema = z.infer<typeof categorySchema>;
export type CategoryCreateSchema = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateSchema = z.infer<typeof categoryUpdateSchema>;
