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
  user_id: integer("user_id")
    .references(() => user.id)
    .notNull(),
  free_lesson_id: integer("free_lesson_id").references(() => freeLesson.id),
  paid_lesson_id: integer("paid_lesson_id").references(() => paidLesson.id),
});

export const userLessonRelations = relations(user_lesson, ({ one }) => ({
  user: one(user, { fields: [user_lesson.user_id], references: [user.id] }),
  freeLesson: one(freeLesson, {
    fields: [user_lesson.free_lesson_id],
    references: [freeLesson.id],
  }),
  paidLesson: one(paidLesson, {
    fields: [user_lesson.paid_lesson_id],
    references: [paidLesson.id],
  }),
}));

export const userLessonSchema = createInsertSchema(user_lesson);
export type UserCourseSchema = z.infer<typeof userLessonSchema>;
