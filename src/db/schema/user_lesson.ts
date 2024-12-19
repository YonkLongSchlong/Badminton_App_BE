import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { paidCourse } from "./paid_course";
import { freeLesson } from "./free_lesson";
import { paidLesson } from "./paid_lesson";
import { freeCourse } from "./free_course";

export const userLesson = pgTable("users_lessons", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  status: integer("status").default(0),
  userId: integer("user_id")
    .references(() => user.id)
    .notNull(),
  freeLessonId: integer("free_lesson_id").references(() => freeLesson.id),
  paidLessonId: integer("paid_lesson_id").references(() => paidLesson.id),
  paidCourseId: integer("paid_course_id").references(() => paidCourse.id),
  freeCourseId: integer("free_course_id").references(() => freeCourse.id),
  courseType: integer("course_type"),
});

export const userLessonRelations = relations(userLesson, ({ one }) => ({
  user: one(user, { fields: [userLesson.userId], references: [user.id] }),
  freeLesson: one(freeLesson, {
    fields: [userLesson.freeLessonId],
    references: [freeLesson.id],
  }),
  paidLesson: one(paidLesson, {
    fields: [userLesson.paidLessonId],
    references: [paidLesson.id],
  }),
  paidCourse: one(paidCourse, {
    fields: [userLesson.paidCourseId],
    references: [paidCourse.id],
  }),
  freeCourse: one(freeCourse, {
    fields: [userLesson.freeCourseId],
    references: [freeCourse.id],
  }),
}));

export const userLessonCreateSchema = createInsertSchema(userLesson, {
  id: (schema) => schema.id.optional(),
  freeLessonId: (schema) => schema.freeLessonId.optional(),
  paidLessonId: (schema) => schema.paidLessonId.optional(),
  freeCourseId: (schema) => schema.freeCourseId.optional(),
  paidCourseId: (schema) => schema.paidCourseId.optional(),
  courseType: (schema) => schema.courseType.optional(),
});

export const userLessonUpdateSchema = createInsertSchema(userLesson, {
  id: (schema) => schema.id.optional(),
  status: (schema) => schema.status.optional(),
  freeLessonId: (schema) => schema.freeLessonId.optional(),
  paidLessonId: (schema) => schema.paidLessonId.optional(),
  paidCourseId: (schema) => schema.paidCourseId.optional(),
  freeCourseId: (schema) => schema.freeCourseId.optional(),
  courseType: (schema) => schema.courseType.optional(),
});

export const userLessonSchema = createInsertSchema(userLesson);
export type UserCourseSchema = z.infer<typeof userLessonSchema>;
export type UserLessonCreateSchema = z.infer<typeof userLessonCreateSchema>;
export type UserLessonUpdateSchema = z.infer<typeof userLessonUpdateSchema>;
