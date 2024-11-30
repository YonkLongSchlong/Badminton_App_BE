import { integer, pgTable } from "drizzle-orm/pg-core";
import { category } from "./category";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { courses } from "./course";
import { freeLesson } from "./free_lesson";
import { question } from "./question";

export const freeCourse = pgTable("free_course", {
  ...courses,
  lessonQuantity: integer("lesson_quantity").default(0),
  categoryId: integer("category_id")
    .references(() => category.id)
    .notNull(),
});

export const freeCourseRelations = relations(freeCourse, ({ one, many }) => ({
  freeLesson: many(freeLesson),
  category: one(category, {
    fields: [freeCourse.categoryId],
    references: [category.id],
  }),
  question: many(question),
}));

export const freeCourseCreateSchema = createInsertSchema(freeCourse, {
  id: (schema) => schema.id.optional(),
  lessonQuantity: (schema) => schema.lessonQuantity.optional(),
});

export const freeCourseUpdateSchema = createInsertSchema(freeCourse, {
  id: (schema) => schema.id.optional(),
  name: (schema) => schema.name.optional(),
  description: (schema) => schema.description.optional(),
  thumbnail: (schema) => schema.thumbnail.optional(),
  type: (schema) => schema.type.optional(),
  lessonQuantity: (schema) => schema.lessonQuantity.optional(),
  categoryId: (schema) => schema.categoryId.optional(),
});

export const freeCourseSchema = createInsertSchema(freeCourse);

export type FreeCourseSchema = z.infer<typeof freeCourseSchema>;
export type FreeCourseCreateSchema = z.infer<typeof freeCourseCreateSchema>;
export type FreeCourseUpdateSchema = z.infer<typeof freeCourseUpdateSchema>;
