import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { paidCourse } from "./paid_course";
import { freeLesson } from "./free_lesson";
import { paidLesson } from "./paid_lesson";

export const user_lesson = pgTable("users_lessons", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  status: integer("status").default(0),
  userId: integer("user_id")
    .references(() => user.id)
    .notNull(),
  freeLessonId: integer("free_lesson_id").references(() => freeLesson.id),
  paidLessonId: integer("paid_lesson_id").references(() => paidLesson.id),
});

export const userLessonRelations = relations(user_lesson, ({ one }) => ({
  user: one(user, { fields: [user_lesson.userId], references: [user.id] }),
  freeLesson: one(freeLesson, {
    fields: [user_lesson.freeLessonId],
    references: [freeLesson.id],
  }),
  paidLesson: one(paidLesson, {
    fields: [user_lesson.paidLessonId],
    references: [paidLesson.id],
  }),
}));

export const userLessonCreateSchema = createInsertSchema(user_lesson, {
  id: (schema) => schema.id.optional(),
  freeLessonId: (schema) => schema.freeLessonId.optional(),
  paidLessonId: (schema) => schema.paidLessonId.optional(),
});

export const userLessonUpdateSchema = createInsertSchema(user_lesson, {
  id: (schema) => schema.id.optional(),
  status: (schema) => schema.status.optional(),
  freeLessonId: (schema) => schema.freeLessonId.optional(),
  paidLessonId: (schema) => schema.paidLessonId.optional(),
});

export const userLessonSchema = createInsertSchema(user_lesson);
export type UserCourseSchema = z.infer<typeof userLessonSchema>;
export type UserLessonCreateSchema = z.infer<typeof userLessonCreateSchema>;
export type UserLessonUpdateSchema = z.infer<typeof userLessonUpdateSchema>;
