import { integer, jsonb, pgTable } from "drizzle-orm/pg-core";
import { baseEntity } from "./base";
import { category } from "./category";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { courses } from "./course";

export const freeCourse = pgTable("free_course", {
  ...baseEntity,
  ...courses,
  content: jsonb("content").notNull(),
  category_id: integer("category_id")
    .references(() => category.id)
    .notNull(),
});

export const freeCourseRelations = relations(freeCourse, ({ one }) => ({
  category: one(category, {
    fields: [freeCourse.category_id],
    references: [category.id],
  }),
}));

export const freeCourseCreateSchema = createInsertSchema(freeCourse, {
  id: (schema) => schema.id.optional(),
});

export const freeCourseUpdateSchema = createInsertSchema(freeCourse, {
  id: (schema) => schema.id.optional(),
  name: (schema) => schema.name.optional(),
  description: (schema) => schema.description.optional(),
  content: (schema) => schema.content.optional(),
  thumbnail: (schema) => schema.thumbnail.optional(),
  type: (schema) => schema.type.optional(),
  category_id: (schema) => schema.category_id.optional(),
});

export const freeCourseSchema = createInsertSchema(freeCourse);

export type FreeCourseSchema = z.infer<typeof freeCourseSchema>;
export type FreeCourseCreateSchema = z.infer<typeof freeCourseCreateSchema>;
export type FreeCourseUpdateSchema = z.infer<typeof freeCourseUpdateSchema>;
