import {
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { paidCourse } from "./paid_course";

export const paidLesson = pgTable("paid_lesson", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  content: jsonb("content").notNull(),
  paidCourseId: integer("paid_course_id")
    .references(() => paidCourse.id)
    .notNull(),
});

export const paidLessonRelations = relations(paidLesson, ({ one }) => ({
  paidCourse: one(paidCourse, {
    fields: [paidLesson.paidCourseId],
    references: [paidCourse.id],
  }),
}));

export const paidLessonCreateSchema = createInsertSchema(paidLesson, {
  id: (schema) => schema.id.optional(),
});

export const paidLessonUpdateSchema = createInsertSchema(paidLesson, {
  id: (schema) => schema.id.optional(),
  content: (schema) => schema.content,
});

export const paidLessonSchema = createInsertSchema(paidLesson);

export type PaidLessonSchema = z.infer<typeof paidLessonSchema>;
export type PaidLessonCreateSchema = z.infer<typeof paidLessonCreateSchema>;
export type PaidLessonUpdateSchema = z.infer<typeof paidLessonUpdateSchema>;
