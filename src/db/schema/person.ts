import { date, pgEnum, text, varchar } from "drizzle-orm/pg-core";
import { baseEntity } from "./base";

export const roleEnum = pgEnum("role", ["admin", "user", "coach"]);

export const persons = {
  ...baseEntity,
  user_name: varchar("user_name", { length: 100 }).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  dob: date("dob"),
  gender: text("gender"),
  avatar: text("avatar"),
  role: roleEnum("role"),
};
