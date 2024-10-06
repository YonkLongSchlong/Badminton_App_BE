import { createInsertSchema } from "drizzle-zod";
import { baseEntity } from "./base";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import type { z } from "zod";
import { relations } from "drizzle-orm";
import { freeCourse } from "./free_course";
import { paidCourse } from "./paid_course";

export const category = pgTable("category", {
  ...baseEntity,
  name: varchar("name", { length: 255 }).notNull(),
});

export const categoryRelations = relations(category, ({ many }) => ({
  freeCourse: many(freeCourse),
  paidCourse: many(paidCourse),
}));

export const categorySchema = createInsertSchema(category);
export type CategorySchema = z.infer<typeof categorySchema>;
