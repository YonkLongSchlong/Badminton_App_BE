import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index";
import { Pool } from "pg";

const connection = new Pool({
  connectionString: Bun.env.DATABASE_URL as string,
});
export const db = drizzle(connection, { schema, logger: true });
export type DB = typeof db;
