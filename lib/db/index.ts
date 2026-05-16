import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql/node";
import * as schema from "./schema";

function createDb(client: ReturnType<typeof createClient>) {
  return drizzle(client, { schema });
}

let dbInstance: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const url = process.env.DATABASE_URL ?? "file:./data/tradiciones.sqlite";
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  const client = createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });

  dbInstance = createDb(client);
  return dbInstance;
}
