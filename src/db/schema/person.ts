import { date, pgEnum, text, varchar } from "drizzle-orm/pg-core";
import { baseEntity } from "./base";

export const roleEnum = pgEnum("role", ["admin", "user", "coach"]);

export const persons = {
  ...baseEntity,
  first_name: varchar("first_name", { length: 100 }).notNull(),
  last_name: varchar("last_name", { length: 100 }).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  dob: date("dob").notNull(),
  avatar: text("avatar"),
  role: roleEnum("role"),
};
