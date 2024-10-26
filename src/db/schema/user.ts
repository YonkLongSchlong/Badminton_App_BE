import { integer, pgTable } from "drizzle-orm/pg-core";
import { persons } from "./person";
import { relations } from "drizzle-orm";
import { user_course } from "./user_course";
import { order } from "./order";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const user = pgTable("user", {
  ...persons,
  startedCourses: integer("started_course"),
  ongoingCourses: integer("ongoing_course"),
  finishedCourse: integer("finished_course"),
});

export const userRelations = relations(user, ({ many }) => ({
  userPaidCourse: many(user_course),
  order: many(order),
}));

export const userCreateSchema = createInsertSchema(user, {
  id: (schema) => schema.id.optional(),
  role: (schema) => schema.role.optional(),
  avatar: (schema) => schema.avatar.optional(),
  dob: (schema) => schema.dob.optional(),
  gender: (schema) => schema.gender.optional(),
  startedCourses: (schema) => schema.startedCourses.optional(),
  ongoingCourses: (schema) => schema.ongoingCourses.optional(),
  finishedCourse: (schema) => schema.finishedCourse.optional(),
});

export const userUpdateSchema = createInsertSchema(user, {
  id: (schema) => schema.id.optional(),
  password: (schema) => schema.password.optional(),
  role: (schema) => schema.role.optional(),
  avatar: (schema) => schema.avatar.optional(),
  startedCourses: (schema) => schema.startedCourses.optional(),
  ongoingCourses: (schema) => schema.ongoingCourses.optional(),
  finishedCourse: (schema) => schema.finishedCourse.optional(),
});

export const userPasswordSchema = z.object({
  password: z.string(),
  newPassword: z.string(),
});

export type UserCreateSchema = z.infer<typeof userCreateSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
export type UserPasswordSchema = z.infer<typeof userPasswordSchema>;
