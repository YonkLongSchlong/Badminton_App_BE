import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { relations } from "drizzle-orm";
import { paidCourse } from "./paid_course";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

export const review = pgTable("review", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  paidCourseId: integer("paid_course_id"),
  rating: integer("rating").default(5),
  comment: text("comment").default(""),
  createAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviewRelations = relations(review, ({ one }) => ({
  user: one(user, { fields: [review.userId], references: [user.id] }),
  paidCourse: one(paidCourse, {
    fields: [review.paidCourseId],
    references: [paidCourse.id],
  }),
}));

export const reviewCreateSchema = createInsertSchema(review, {
  id: (schema) => schema.id.optional(),
  comment: (schema) => schema.comment.optional(),
});

export const reviewUpdateSchema = createInsertSchema(review, {
  id: (schema) => schema.id.optional(),
  rating: (schema) => schema.rating.optional(),
  comment: (schema) => schema.comment.optional(),
});

export type ReviewCreateSchema = z.infer<typeof reviewCreateSchema>;
export type ReviewUpdateSchema = z.infer<typeof reviewUpdateSchema>;
