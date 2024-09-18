import {
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { baseEntity } from "./base";
import { coach } from "./coach";
import { category } from "./category";
import { relations } from "drizzle-orm";
import { user_course } from "./user_course";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

export const courseType = pgEnum("type", ["online", "offline"]);
export const courseStatus = pgEnum("status", ["open", "close"]);

export const course = pgTable("course", {
  ...baseEntity,
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  register_start_date: date("register_start_date"),
  register_end_date: date("register_end_date"),
  begin_date: date("begin_date"),
  end_date: date("end_date"),
  duration: text("duration"),
  price: decimal("price"),
  student_quantity: integer("student_quantity"),
  course_type: courseType("type").notNull(),
  status: courseStatus("status"),
  coach_id: integer("coach_id")
    .references(() => coach.id)
    .notNull(),
  category_id: integer("category_id")
    .references(() => category.id)
    .notNull(),
  thumbnail: text("thumbnail").notNull(),
});

export const courseRelations = relations(course, ({ one, many }) => ({
  user_course: many(user_course),
  category: one(category, {
    fields: [course.category_id],
    references: [category.id],
  }),
  coach: one(coach, { fields: [course.coach_id], references: [coach.id] }),
}));

export const courseSchema = createInsertSchema(course);
export type CourseSchema = z.infer<typeof courseSchema>;
