import { pgTable } from "drizzle-orm/pg-core";
import { persons } from "./person";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { relations } from "drizzle-orm";
import { freeCourse } from "./free_course";

export const admin = pgTable("admin", {
  ...persons,
});

export const adminCreateSchema = createInsertSchema(admin, {
  id: (schema) => schema.id.optional(),
  role: (schema) => schema.role.optional(),
  avatar: (schema) => schema.avatar.optional(),
});

export const adminUpdateSchema = createInsertSchema(admin, {
  id: (schema) => schema.id.optional(),
  role: (schema) => schema.role.optional(),
  avatar: (schema) => schema.avatar.optional(),
});

export type AdminCreateSchema = z.infer<typeof adminCreateSchema>;
export type adminUpdateSchema = z.infer<typeof adminUpdateSchema>;
