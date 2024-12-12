import {
  decimal,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./user";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { paidCourse } from "./paid_course";

export const order = pgTable("order", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  total: decimal("total").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", {
    length: 255,
  }),
  status: varchar("status", { length: 255 }).default("pending"),
  paidCourseId: integer("paid_course_id")
    .references(() => paidCourse.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => user.id)
    .notNull(),
});

export const orderRelations = relations(order, ({ one }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  paidCourse: one(paidCourse, {
    fields: [order.paidCourseId],
    references: [paidCourse.id],
  }),
}));

export const orderCreateSchema = createInsertSchema(order, {
  id: (schema) => schema.id.optional(),
  status: (schema) => schema.status.optional(),
  stripePaymentIntentId: (schema) => schema.stripePaymentIntentId.optional(),
});

export const orderUpdateCreatedAtSchema = z.object({
  created_at: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "created_at must be a valid date in the format YYYY-MM-DD"
    ),
});

export const paymentIntentCreateSchema = z.object({
  user_id: z.number(),
  coursePrice: z.number(),
  courseName: z.string(),
  total: z.number(),
  orderId: z.number(),
});

export const orderSchema = createInsertSchema(order);
export type OrderSchema = z.infer<typeof orderSchema>;
export type OrderCreateSchema = z.infer<typeof orderCreateSchema>;
export type OrderUpdateCreatedAtSchema = z.infer<
  typeof orderUpdateCreatedAtSchema
>;
export type PaymentIntentCreateSchema = z.infer<
  typeof paymentIntentCreateSchema
>;
