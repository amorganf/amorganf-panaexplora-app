import { query } from "../lib/db";
export const dynamic = "force-dynamic";

export default async function TestDb() {
  const { rows } = await query<{ now: Date; version: string }>(
    "SELECT NOW() AS now, version() AS version",
  );
  return (
    <main className="container py-5">
      <p className="text-success">Conexión correcta</p>
      <p>{rows[0].now.toString()}</p>
      <small>{rows[0].version}</small>
    </main>
  );
}
