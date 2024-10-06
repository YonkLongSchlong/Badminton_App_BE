import { date, pgEnum, text, varchar } from "drizzle-orm/pg-core";
import { baseEntity } from "./base";

export const courseType = pgEnum("type", ["free", "paid"]);

export const courses = {
  ...baseEntity,
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: courseType("type"),
  thumbnail: text("thumbnail").notNull(),
};
