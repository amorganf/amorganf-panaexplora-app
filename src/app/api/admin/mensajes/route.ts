import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/auth";
import { query } from "../../../lib/db";
export async function GET() {
  if (!(await requireAdmin(["SUPERADMIN", "ADMIN"])))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { rows } = await query(
    "SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 500",
  );
  return NextResponse.json(rows);
}
export async function PATCH(req: Request) {
  if (!(await requireAdmin(["SUPERADMIN", "ADMIN"])))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const b = await req.json();
  if (
    !Number.isSafeInteger(Number(b.id)) ||
    !["NEW", "READ", "RESOLVED"].includes(b.status)
  )
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const r = await query(
    "UPDATE contact_messages SET status=$1 WHERE id=$2 RETURNING id",
    [b.status, b.id],
  );
  return NextResponse.json(
    { ok: !!r.rowCount },
    { status: r.rowCount ? 200 : 404 },
  );
}
export async function DELETE(req: Request) {
  if (!(await requireAdmin(["SUPERADMIN", "ADMIN"])))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isSafeInteger(id) || id < 1)
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  const r = await query(
    "DELETE FROM contact_messages WHERE id=$1 RETURNING id",
    [id],
  );
  return NextResponse.json(
    { ok: !!r.rowCount },
    { status: r.rowCount ? 200 : 404 },
  );
}
