import { relations } from "drizzle-orm";
import {
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "user", "coach"]);
export const courseType = pgEnum("type", ["online", "offline"]);
export const courseStatus = pgEnum("status", ["open", "close"]);

export const baseEntity = {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
};

export const persons = {
  ...baseEntity,
  first_name: varchar("first_name", { length: 100 }).notNull(),
  last_name: varchar("last_name", { length: 100 }).notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  dob: date("dob").notNull(),
  avatar: text("avatar"),
  role: roleEnum("role"),
};

export const users = pgTable("users", {
  ...persons,
  started_courses: integer("started_course"),
  ongoing_courses: integer("ongoing_course"),
  finished_course: integer("finished_course"),
});

export const coaches = pgTable("coaches", {
  ...persons,
  description: text("description").notNull(),
});

export const admins = pgTable("admins", {
  ...persons,
});

export const categories = pgTable("categories", {
  ...baseEntity,
  name: varchar("name", { length: 255 }).notNull(),
});

export const courses = pgTable("course", {
  ...baseEntity,
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  register_start_date: date("register_start_date"),
  register_end_date: date("register_end_date"),
  begin_date: date("begin_date"),
  end_date: date("end_date"),
  duration: text("duration"),
  price: decimal("price"),
  student_quantity: integer("student_quantity"),
  course_type: courseType("type").notNull(),
  status: courseStatus("status"),
  coach_id: integer("coach_id")
    .references(() => coaches.id)
    .notNull(),
  category_id: integer("category_id")
    .references(() => categories.id)
    .notNull(),
  thumbnail: text("thumbnail").notNull(),
});

export const user_course = pgTable("users_courses", {
  ...baseEntity,
  user_id: integer("user_id")
    .references(() => users.id)
    .notNull(),
  course_id: integer("course_id")
    .references(() => courses.id)
    .notNull(),
});

export const orders = pgTable("orders", {
  ...baseEntity,
  total: decimal("total").notNull(),
  course_id: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  user_id: integer("user_id")
    .references(() => users.id)
    .notNull(),
});

export const courseRelations = relations(courses, ({ one, many }) => ({
  user_course: many(user_course),
  category: one(categories, {
    fields: [courses.category_id],
    references: [categories.id],
  }),
  coach: one(coaches, { fields: [courses.coach_id], references: [coaches.id] }),
}));

export const userRelations = relations(users, ({ many }) => ({
  user_course: many(user_course),
  order: many(orders),
}));

export const userCourseRelations = relations(user_course, ({ one }) => ({
  user: one(users, { fields: [user_course.user_id], references: [users.id] }),
  course: one(courses, {
    fields: [user_course.course_id],
    references: [courses.id],
  }),
}));
