import { integer, pgTable } from "drizzle-orm/pg-core";
import { persons } from "./person";
import { relations } from "drizzle-orm";
import { user_course } from "./user_course";
import { order } from "./order";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const user = pgTable("user", {
  ...persons,
  started_courses: integer("started_course"),
  ongoing_courses: integer("ongoing_course"),
  finished_course: integer("finished_course"),
});

export const userRelations = relations(user, ({ many }) => ({
  user_course: many(user_course),
  order: many(order),
}));

export const userCreateSchema = createInsertSchema(user, {
  id: (schema) => schema.id.optional(),
  role: (schema) => schema.role.optional(),
  avatar: (schema) => schema.avatar.optional(),
  started_courses: (schema) => schema.started_courses.optional(),
  ongoing_courses: (schema) => schema.ongoing_courses.optional(),
  finished_course: (schema) => schema.finished_course.optional(),
});

export const userUpdateSchema = createInsertSchema(user, {
  id: (schema) => schema.id.optional(),
  password: (schema) => schema.password.optional(),
  role: (schema) => schema.role.optional(),
  avatar: (schema) => schema.avatar.optional(),
  started_courses: (schema) => schema.started_courses.optional(),
  ongoing_courses: (schema) => schema.ongoing_courses.optional(),
  finished_course: (schema) => schema.finished_course.optional(),
});

export const userPasswordSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
});

export type UserCreateSchema = z.infer<typeof userCreateSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
export type UserPasswordSchema = z.infer<typeof userPasswordSchema>;
