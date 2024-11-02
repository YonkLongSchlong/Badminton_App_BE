import { pgEnum, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const courseType = pgEnum("type", ["free", "paid"]);

export const courses = {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: courseType("type"),
  thumbnail: text("thumbnail").notNull(),
};
