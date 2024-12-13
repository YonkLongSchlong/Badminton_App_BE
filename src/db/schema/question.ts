import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { freeCourse } from "./free_course";
import { paidCourse } from "./paid_course";
import { answer } from "./answer";
import { freeLesson } from "./free_lesson";
import { paidLesson } from "./paid_lesson";

export const question = pgTable("question", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  text: text("text").notNull(),
  rightAnswer: varchar("right_answer").notNull(),
  freeLessonId: integer("free_lesson_id").references(() => freeLesson.id, {
    onDelete: "cascade",
  }),
  paidLessonId: integer("paid_lesson_id").references(() => paidLesson.id, {
    onDelete: "cascade",
  }),
});

export const questionRelations = relations(question, ({ many, one }) => ({
  answer: many(answer),
  freeLesson: one(freeLesson, {
    fields: [question.freeLessonId],
    references: [freeLesson.id],
  }),
  paidLesson: one(paidLesson, {
    fields: [question.paidLessonId],
    references: [paidLesson.id],
  }),
}));

export const questionCreateSchema = createInsertSchema(question, {
  id: (schema) => schema.id.optional(),
});

export const questionUpdateSchema = createInsertSchema(question, {
  id: (schema) => schema.id.optional(),
  text: (schema) => schema.text,
  freeLessonId: (schema) => schema.freeLessonId.optional(),
  paidLessonId: (schema) => schema.paidLessonId.optional(),
});

export const questionSchema = createInsertSchema(question);

export type QuestionSchema = z.infer<typeof questionSchema>;
export type QuestionCreateSchema = z.infer<typeof questionCreateSchema>;
export type QuestionUpdateSchema = z.infer<typeof questionUpdateSchema>;
