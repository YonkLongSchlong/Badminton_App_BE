import { decimal, integer, pgTable } from "drizzle-orm/pg-core";
import { baseEntity } from "./base";
import { user } from "./user";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { paidCourse } from "./paid_course";

export const order = pgTable("order", {
  ...baseEntity,
  total: decimal("total").notNull(),
  paid_course_id: integer("paid_course_id")
    .references(() => paidCourse.id)
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
  paidCourse: one(paidCourse, {
    fields: [order.paid_course_id],
    references: [paidCourse.id],
  }),
}));

export const orderSchema = createInsertSchema(order);
export type OrderSchema = z.infer<typeof orderSchema>;
