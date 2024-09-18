import { serial, timestamp } from "drizzle-orm/pg-core";

export const baseEntity = {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
};
