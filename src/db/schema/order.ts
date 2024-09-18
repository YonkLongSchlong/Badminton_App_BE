import { decimal, integer, pgTable } from "drizzle-orm/pg-core";
import { baseEntity } from "./base";
import { course } from "./course";
import { user } from "./user";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

export const order = pgTable("order", {
  ...baseEntity,
  total: decimal("total").notNull(),
  course_id: integer("course_id")
    .references(() => course.id)
    .notNull(),
  user_id: integer("user_id")
    .references(() => user.id)
    .notNull(),
});

export const orderRelations = relations(order, ({ one }) => ({
  user: one(user, {
    fields: [order.user_id],
    references: [user.id],
  }),
  course: one(course, {
    fields: [order.course_id],
    references: [course.id],
  }),
}));

export const orderSchema = createInsertSchema(order);
export type OrderSchema = z.infer<typeof orderSchema>;
