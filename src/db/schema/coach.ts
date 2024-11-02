import {
  date,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { paidCourse } from "./paid_course";

export const roleEnum = pgEnum("role", ["admin", "user", "coach"]);

export const coach = pgTable("coach", {
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
  description: text("description"),
});

export const coachRelations = relations(coach, ({ many }) => ({
  paidCourse: many(paidCourse),
}));

export const coachCreateSchema = createInsertSchema(coach, {
  id: (schema) => schema.id.optional(),
  role: (schema) => schema.role.optional(),
  avatar: (schema) => schema.avatar.optional(),
  description: (schema) => schema.description.optional(),
});

export const coachUpdateSchema = createInsertSchema(coach, {
  id: (schema) => schema.id.optional(),
  password: (schema) => schema.password.optional(),
  role: (schema) => schema.role.optional(),
  avatar: (schema) => schema.avatar.optional(),
  description: (schema) => schema.description.optional(),
});

export const coachPasswordSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
});

export type CoachCreateSchema = z.infer<typeof coachCreateSchema>;
export type CoachUpdateSchema = z.infer<typeof coachUpdateSchema>;
export type CoachPasswordSchema = z.infer<typeof coachPasswordSchema>;
