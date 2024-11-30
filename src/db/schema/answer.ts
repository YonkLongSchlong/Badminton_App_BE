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
import { question } from "./question";

export const answer = pgTable("answer", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  text: text("text").notNull(),
  questionId: integer("question_id").references(() => question.id),
});

export const answerRelations = relations(answer, ({ one }) => ({
  question: one(question, {
    fields: [answer.questionId],
    references: [question.id],
  }),
}));

export const answerCreateSchema = createInsertSchema(answer, {
  id: (schema) => schema.id.optional(),
});

export const answerUpdateSchema = createInsertSchema(answer, {
  id: (schema) => schema.id.optional(),
  text: (schema) => schema.text,
  questionId: (schema) => schema.questionId.optional(),
});

export const answerSchema = createInsertSchema(answer);

export type AnswerSchema = z.infer<typeof answerSchema>;
export type AnswerCreateSchema = z.infer<typeof answerCreateSchema>;
export type AnswerUpdateSchema = z.infer<typeof answerUpdateSchema>;
