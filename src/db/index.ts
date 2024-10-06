import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index";
import { Pool } from "pg";
import { createClient } from "redis";

const connection = new Pool({
  connectionString: Bun.env.DATABASE_URL as string,
});

export const redisClient = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

export const db = drizzle(connection, { schema, logger: true });
export type DB = typeof db;
