import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { paidCourse } from "./paid_course";
import { freeCourse } from "./free_course";
import { freeLesson } from "./free_lesson";
import { paidLesson } from "./paid_lesson";

export const user_course = pgTable("users_courses", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  status: integer("status").default(0),
  user_id: integer("user_id")
    .references(() => user.id)
    .notNull(),
  paid_course_id: integer("paid_course_id").references(() => paidCourse.id),
  free_course_id: integer("free_course_id").references(() => freeCourse.id),
});

export const userCourseRelations = relations(user_course, ({ one }) => ({
  user: one(user, { fields: [user_course.user_id], references: [user.id] }),
  paidCourse: one(paidCourse, {
    fields: [user_course.paid_course_id],
    references: [paidCourse.id],
  }),
  freeCourse: one(freeCourse, {
    fields: [user_course.free_course_id],
    references: [freeCourse.id],
  }),
}));

export const userCourseCreateSchema = createInsertSchema(user_course, {
  id: (schema) => schema.id.optional(),
  created_at: (schema) => schema.created_at.optional(),
  updated_at: (schema) => schema.updated_at.optional(),
  paid_course_id: (schema) => schema.paid_course_id.optional(),
  free_course_id: (schema) => schema.free_course_id.optional(),
});

export const userCourseUpdateSchema = createInsertSchema(user_course, {
  id: (schema) => schema.id.optional(),
  created_at: (schema) => schema.created_at.optional(),
  updated_at: (schema) => schema.updated_at.optional(),
  paid_course_id: (schema) => schema.paid_course_id.optional(),
  free_course_id: (schema) => schema.free_course_id.optional(),
  status: (schema) => schema.status.optional(),
});

export const userCourseSchema = createInsertSchema(user_course);
export type UserCourseSchema = z.infer<typeof userCourseSchema>;
export type UserCourseCreateSchema = z.infer<typeof userCourseCreateSchema>;
export type UserCourseUpdateSchema = z.infer<typeof userCourseUpdateSchema>;
