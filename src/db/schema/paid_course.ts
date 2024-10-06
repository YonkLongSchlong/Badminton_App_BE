import {
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
} from "drizzle-orm/pg-core";
import { baseEntity } from "./base";
import { coach } from "./coach";
import { category } from "./category";
import { relations } from "drizzle-orm";
import { user_course } from "./user_course";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { courses } from "./course";

export const courseStatus = pgEnum("status", ["open", "close"]);

export const paidCourse = pgTable("paid_course", {
  ...baseEntity,
  ...courses,
  register_start_date: date("register_start_date"),
  register_end_date: date("register_end_date"),
  begin_date: date("begin_date"),
  end_date: date("end_date"),
  duration: text("duration"),
  price: decimal("price"),
  student_quantity: integer("student_quantity"),
  status: courseStatus("status"),
  coach_id: integer("coach_id")
    .references(() => coach.id)
    .notNull(),
  category_id: integer("category_id")
    .references(() => category.id)
    .notNull(),
});

export const paidCourseRelations = relations(paidCourse, ({ one, many }) => ({
  user_course: many(user_course),
  category: one(category, {
    fields: [paidCourse.category_id],
    references: [category.id],
  }),
  coach: one(coach, { fields: [paidCourse.coach_id], references: [coach.id] }),
}));

export const courseCreateSchema = createInsertSchema(paidCourse, {
  id: (schema) => schema.id.optional(),
});

export const courseSchema = createInsertSchema(paidCourse);
export type CourseSchema = z.infer<typeof courseSchema>;
