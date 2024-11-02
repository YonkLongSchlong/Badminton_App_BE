import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { paidCourse } from "./paid_course";

export const user_course = pgTable("users_courses", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  user_id: integer("user_id")
    .references(() => user.id)
    .notNull(),
  paid_course_id: integer("paid_course_id")
    .references(() => paidCourse.id)
    .notNull(),
});

export const userCourseRelations = relations(user_course, ({ one }) => ({
  user: one(user, { fields: [user_course.user_id], references: [user.id] }),
  paidCourse: one(paidCourse, {
    fields: [user_course.paid_course_id],
    references: [paidCourse.id],
  }),
}));

export const userCourseSchema = createInsertSchema(user_course);
export type UserCourseSchema = z.infer<typeof userCourseSchema>;
