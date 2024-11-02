import { decimal, integer, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { coach } from "./coach";
import { category } from "./category";
import { relations } from "drizzle-orm";
import { user_course } from "./user_course";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { courses } from "./course";
import { paidLesson } from "./paid_lesson";

export const courseStatus = pgEnum("status", ["publish", "non-publish"]);

export const paidCourse = pgTable("paid_course", {
  ...courses,
  price: decimal("price"),
  lessonQuantity: integer("lesson_quantity"),
  studentQuantity: integer("student_quantity"),
  status: courseStatus("status"),
  coachId: integer("coach_id")
    .references(() => coach.id)
    .notNull(),
  categoryId: integer("category_id")
    .references(() => category.id)
    .notNull(),
});

export const paidCourseRelations = relations(paidCourse, ({ one, many }) => ({
  user_course: many(user_course),
  paidLesson: many(paidLesson),
  category: one(category, {
    fields: [paidCourse.categoryId],
    references: [category.id],
  }),
  coach: one(coach, { fields: [paidCourse.coachId], references: [coach.id] }),
}));

export const paidCourseCreateSchema = createInsertSchema(paidCourse, {
  id: (schema) => schema.id.optional(),
  lessonQuantity: (schema) => schema.lessonQuantity.optional(),
  studentQuantity: (schema) => schema.studentQuantity.optional(),
});

export const paidCourseUpdateSchema = createInsertSchema(paidCourse, {
  id: (schema) => schema.id.optional(),
  name: (schema) => schema.name.optional(),
  description: (schema) => schema.description.optional(),
  thumbnail: (schema) => schema.thumbnail.optional(),
  type: (schema) => schema.type.optional(),
  status: (schema) => schema.status.optional(),
  studentQuantity: (schema) => schema.studentQuantity.optional(),
  lessonQuantity: (schema) => schema.lessonQuantity.optional(),
  price: (schema) => schema.price.optional(),
  coachId: (schema) => schema.coachId.optional(),
  categoryId: (schema) => schema.categoryId.optional(),
});

export const paidCourseSchema = createInsertSchema(paidCourse);
export type CourseSchema = z.infer<typeof paidCourseSchema>;
export type PaidCourseCreateSchema = z.infer<typeof paidCourseCreateSchema>;
export type PaidCourseUpdateSchema = z.infer<typeof paidCourseUpdateSchema>;
