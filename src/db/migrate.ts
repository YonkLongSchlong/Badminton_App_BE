import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const migrationClient = postgres(Bun.env.DATABASE_URL as string, { max: 1 });
const sql = drizzle(migrationClient);

const main = async () => {
  try {
    await migrate(sql, { migrationsFolder: "src/db/migrations" });
    console.log("Migration successful");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

main();
