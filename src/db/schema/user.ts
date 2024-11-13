import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user_course } from "./user_course";
import { order } from "./order";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["admin", "user", "coach"]);

export const user = pgTable("user", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  dob: date("dob"),
  gender: text("gender"),
  avatar: text("avatar"),
  role: roleEnum("role"),
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
  firstName: (schema) => schema.firstName.optional(),
  lastName: (schema) => schema.lastName.optional(),
  dob: (schema) => schema.dob.optional(),
  gender: (schema) => schema.dob.optional(),
  password: (schema) => schema.password.optional(),
  role: (schema) => schema.role.optional(),
  avatar: (schema) => schema.avatar.optional(),
  startedCourses: (schema) => schema.startedCourses.optional(),
  ongoingCourses: (schema) => schema.ongoingCourses.optional(),
  finishedCourse: (schema) => schema.finishedCourse.optional(),
});

export const userAvatarSchema = z.object({
  fileName: z.string(),
  file: z.string().base64(),
  contentType: z.string(),
});

export const userPasswordSchema = z.object({
  password: z.string(),
  newPassword: z.string(),
});

export type UserCreateSchema = z.infer<typeof userCreateSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
export type UserPasswordSchema = z.infer<typeof userPasswordSchema>;
export type UserAvatarSchema = z.infer<typeof userAvatarSchema>;
