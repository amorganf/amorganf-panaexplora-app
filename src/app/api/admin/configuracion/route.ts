import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser, type Role } from "../../../../lib/auth";
import { pool } from "../../../../lib/db";
import { getSettings, settingKeys } from "../../../../lib/data/settings";

// Igual que en el menú del admin: solo SUPERADMIN ve "Configuración".
const ALLOWED: readonly Role[] = ["SUPERADMIN"];
const MAX_LENGTH = 50_000;

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function authorize() {
  const user = await getCurrentUser();
  if (!user) return error("No autorizado", 401);
  if (!ALLOWED.includes(user.role)) return error("Permisos insuficientes", 403);
  return null;
}

// Defensa extra contra CSRF: el cambio debe venir de este mismo sitio.
function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function GET() {
  const denied = await authorize();
  if (denied) return denied;

  try {
    return NextResponse.json(await getSettings());
  } catch (e) {
    console.error("[SETTINGS]", e);
    return error(
      "No se pudo leer la configuración. Comprueba que existe la tabla site_settings.",
      500,
    );
  }
}

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return error("Origen no permitido", 403);
  const denied = await authorize();
  if (denied) return denied;

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body))
      return error("Datos inválidos", 400);
    const input = body as Record<string, unknown>;

    // Solo se guardan las claves conocidas que vengan en la petición;
    // las demás se ignoran. Así un formulario parcial no borra nada.
    const values: Record<string, string> = {};
    for (const key of settingKeys) {
      const value = input[key];
      if (value === undefined) continue;
      if (typeof value !== "string") return error(`Valor inválido en ${key}`, 400);
      if (value.length > MAX_LENGTH) return error(`${key} es demasiado largo`, 400);
      values[key] = key.endsWith("_id") || key.endsWith("_client") ? value.trim() : value;
    }
    if (Object.keys(values).length === 0) return error("No hay cambios que guardar", 400);

    // Se valida el resultado final (lo guardado más lo nuevo).
    const merged: Record<string, string | undefined> = { ...(await getSettings()), ...values };

    for (const key of ["analytics_enabled", "adsense_enabled"]) {
      if (merged[key] !== undefined && !["true", "false"].includes(merged[key]!))
        return error("Activación inválida", 400);
    }
    if (merged.analytics_id && !/^G-[A-Z0-9]+$/.test(merged.analytics_id))
      return error("ID de Analytics inválido. Debe tener el formato G-XXXXXXXXXX.", 400);
    if (merged.adsense_client && !/^ca-pub-\d{10,20}$/.test(merged.adsense_client))
      return error("ID de AdSense inválido. Debe tener el formato ca-pub-0000000000000000.", 400);
    if (merged.analytics_enabled === "true" && !merged.analytics_id)
      return error("Para activar Analytics indica el ID de medición.", 400);
    if (merged.adsense_enabled === "true" && !merged.adsense_client)
      return error("Para activar AdSense indica el ID de cliente.", 400);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const [key, value] of Object.entries(values)) {
        await client.query(
          `INSERT INTO site_settings (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, value],
        );
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    // Aplica los cambios en el sitio público de inmediato.
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[SETTINGS]", e);
    return error("Error al guardar la configuración", 500);
  }
}