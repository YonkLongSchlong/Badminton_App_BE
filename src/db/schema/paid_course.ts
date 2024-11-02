import { decimal, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { coach } from "./coach";
import { category } from "./category";
import { relations } from "drizzle-orm";
import { user_course } from "./user_course";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { courses } from "./course";

export const courseStatus = pgEnum("status", ["open", "close"]);

export const paidCourse = pgTable("paid_course", {
  ...courses,
  duration: text("duration"),
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
  category: one(category, {
    fields: [paidCourse.categoryId],
    references: [category.id],
  }),
  coach: one(coach, { fields: [paidCourse.coachId], references: [coach.id] }),
}));

export const courseCreateSchema = createInsertSchema(paidCourse, {
  id: (schema) => schema.id.optional(),
});

export const courseSchema = createInsertSchema(paidCourse);
export type CourseSchema = z.infer<typeof courseSchema>;
