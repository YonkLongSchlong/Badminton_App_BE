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
import { freeCourse } from "./free_course";

export const freeLesson = pgTable("free_lesson", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  content: jsonb("content").notNull(),
  freeCourseId: integer("free_course_id")
    .references(() => freeCourse.id)
    .notNull(),
});

export const freeLessonRelations = relations(freeLesson, ({ one }) => ({
  freeCourse: one(freeCourse, {
    fields: [freeLesson.freeCourseId],
    references: [freeCourse.id],
  }),
}));

export const freeLessonCreateSchema = createInsertSchema(freeLesson, {
  id: (schema) => schema.id.optional(),
});

export const freeLessonUpdateSchema = createInsertSchema(freeLesson, {
  id: (schema) => schema.id.optional(),
  content: (schema) => schema.content,
  freeCourseId: (schema) => schema.freeCourseId.optional(),
});

export const freeLessonSchema = createInsertSchema(freeLesson);

export type FreeLessonSchema = z.infer<typeof freeLessonSchema>;
export type FreeLessonCreateSchema = z.infer<typeof freeLessonCreateSchema>;
export type FreeLessonUpdateSchema = z.infer<typeof freeLessonUpdateSchema>;