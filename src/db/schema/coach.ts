import { pgTable, text } from "drizzle-orm/pg-core";
import { persons } from "./person";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { course } from "./course";

export const coach = pgTable("coach", {
  ...persons,
  description: text("description"),
});

export const coachRelations = relations(coach, ({ many }) => ({
  course: many(course),
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
