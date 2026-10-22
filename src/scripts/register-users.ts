import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as dotenv from "dotenv";
import * as schema from "../lib/db/schema";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL no configurada");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  try {
    await db
      .insert(schema.users)
      .values([
        {
          id: "yaninasebriano13@gmail.com",
          email: "yaninasebriano13@gmail.com",
          name: "Yanina Sebriano",
          role: "student",
        },
        {
          id: "abelkuarahy@gmail.com",
          email: "abelkuarahy@gmail.com",
          name: "Abel Nuñez",
          role: "admin",
        },
        {
          id: "abelkuarahy@hotmail.com",
          email: "abelkuarahy@hotmail.com",
          name: "Abel Nuñez",
          role: "admin",
        },
      ])
      .onConflictDoNothing();

    console.log("✅ Usuarios registrados en Neon: Yanina (student) y Abel (admin)");
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
