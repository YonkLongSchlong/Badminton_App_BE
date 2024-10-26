import { date, pgEnum, text, varchar } from "drizzle-orm/pg-core";
import { baseEntity } from "./base";

export const roleEnum = pgEnum("role", ["admin", "user", "coach"]);

export const persons = {
  ...baseEntity,
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  dob: date("dob"),
  gender: text("gender"),
  avatar: text("avatar"),
  role: roleEnum("role"),
};
