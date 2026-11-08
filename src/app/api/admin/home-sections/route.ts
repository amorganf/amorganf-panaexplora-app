import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { query } from "../../../../lib/db";
const keys = new Set(["hero", "featured", "categories", "latest"]);
async function authorized() {
  return requireAdmin(["SUPERADMIN", "ADMIN"]);
}
export async function GET() {
  if (!(await authorized()))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const r = await query(
      "SELECT section_key,title,enabled,sort_order FROM home_sections ORDER BY sort_order,section_key",
    );
    return NextResponse.json(r.rows);
  } catch (e) {
    console.error("[HOME SECTIONS GET]", e);
    return NextResponse.json(
      {
        error:
          "Error al consultar secciones. ¿Ejecutaste 04_home_sections.sql?",
      },
      { status: 500 },
    );
  }
}
export async function PUT(req: Request) {
  if (!(await authorized()))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const body = await req.json();
    if (
      !body ||
      !keys.has(body.section_key) ||
      typeof body.enabled !== "boolean" ||
      typeof body.title !== "string" ||
      body.title.trim().length < 2 ||
      body.title.length > 160 ||
      !Number.isSafeInteger(body.sort_order) ||
      body.sort_order < 0 ||
      body.sort_order > 10000
    )
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    const r = await query(
      "UPDATE home_sections SET title=$1,enabled=$2,sort_order=$3,updated_at=NOW() WHERE section_key=$4 RETURNING section_key,title,enabled,sort_order",
      [body.title.trim(), body.enabled, body.sort_order, body.section_key],
    );
    return NextResponse.json(r.rows[0]);
  } catch (e) {
    console.error("[HOME SECTIONS PUT]", e);
    return NextResponse.json(
      { error: "No se pudo actualizar" },
      { status: 500 },
    );
  }
}
