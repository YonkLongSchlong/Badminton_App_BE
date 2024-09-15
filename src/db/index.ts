import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connection = postgres(Bun.env.DATABASE_URL as string);
export const db = drizzle(connection, { schema });
