//Paso 3: instala los paquetes en tu proyecto
//npm install pg server-only
//npm install -D @types/pg
//
import "server-only";
import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL en el archivo .env.local");
}

export const pool =
  global.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl:
      process.env.PGSSL === "true" ? { rejectUnauthorized: true } : undefined,
  });

if (process.env.NODE_ENV !== "production") global.pgPool = pool;

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  return pool.query<T>(text, params);
}
