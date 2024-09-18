import { integer, pgTable } from "drizzle-orm/pg-core";
import { baseEntity } from "./base";
import { user } from "./user";
import { course } from "./course";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

export const user_course = pgTable("users_courses", {
  ...baseEntity,
  user_id: integer("user_id")
    .references(() => user.id)
    .notNull(),
  course_id: integer("course_id")
    .references(() => course.id)
    .notNull(),
});

export const userCourseRelations = relations(user_course, ({ one }) => ({
  user: one(user, { fields: [user_course.user_id], references: [user.id] }),
  course: one(course, {
    fields: [user_course.course_id],
    references: [course.id],
  }),
}));

export const userCourseSchema = createInsertSchema(user_course);
export type UserCourseSchema = z.infer<typeof userCourseSchema>;
