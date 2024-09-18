import { pgTable, text } from "drizzle-orm/pg-core";
import { persons } from "./person";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

export const coach = pgTable("coach", {
  ...persons,
  description: text("description").notNull(),
});

export const coachSchema = createInsertSchema(coach);
export type CoachSchema = z.infer<typeof coachSchema>;
