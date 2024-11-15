import {
  date,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

export const roleEnum = pgEnum("role", ["admin", "user", "coach"]);

export const admin = pgTable("admin", {
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
});

export const adminCreateSchema = createInsertSchema(admin, {
  id: (schema) => schema.id.optional(),
  role: (schema) => schema.role.optional(),
  avatar: (schema) => schema.avatar.optional(),
});

export const adminUpdateSchema = createInsertSchema(admin, {
  id: (schema) => schema.id.optional(),
  firstName: (schema) => schema.firstName.optional(),
  lastName: (schema) => schema.lastName.optional(),
  password: (schema) => schema.password.optional(),
  dob: (schema) => schema.dob.optional(),
  gender: (schema) => schema.gender.optional(),
  role: (schema) => schema.role.optional(),
  avatar: (schema) => schema.avatar.optional(),
});

export type AdminCreateSchema = z.infer<typeof adminCreateSchema>;
export type AdminUpdateSchema = z.infer<typeof adminUpdateSchema>;
