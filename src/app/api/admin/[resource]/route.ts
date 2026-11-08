import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { query } from "../../../../lib/db";
import { ALL_ROLES, requireAdmin, type Role } from "../../../../lib/auth";
import { slugify } from "../../../../lib/slug";
import { destinationSchema, articleSchema } from "../../../../lib/validators";

type Ctx = { params: Promise<{ resource: string }> };
type Mode = "read" | "write";

const ADMINS: readonly Role[] = ["SUPERADMIN", "ADMIN"];
const SUPER: readonly Role[] = ["SUPERADMIN"];

// read: quién puede listar. write: quién puede crear, editar y borrar.
// Las categorías, provincias y distritos se pueden leer con cualquier rol
// porque los formularios de destinos y artículos los necesitan.
// Mantén estos permisos alineados con el menú del admin.
const RESOURCES: Record<string, { table: string; read: readonly Role[]; write: readonly Role[] }> = {
  destinations: { table: "destinations", read: ALL_ROLES, write: ALL_ROLES },
  articles: { table: "articles", read: ALL_ROLES, write: ALL_ROLES },
  gallery: { table: "destination_images", read: ALL_ROLES, write: ALL_ROLES },
  categories: { table: "categories", read: ALL_ROLES, write: ADMINS },
  provinces: { table: "provinces", read: ALL_ROLES, write: ADMINS },
  districts: { table: "districts", read: ALL_ROLES, write: ADMINS },
  ads: { table: "ad_placements", read: ADMINS, write: ADMINS },
  users: { table: "users", read: SUPER, write: SUPER },
};

function response(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function errorResponse(e: unknown) {
  console.error("[ADMIN API]", e);
  const code = (e as { code?: string })?.code;
  if (code === "SEO_URL")
    return response(e instanceof Error ? e.message : "URL SEO inválida", 400);
  if (code === "23505")
    return response("Ya existe un registro con ese nombre, usuario o slug.", 409);
  if (code === "23503")
    return response(
      "El registro está relacionado con otros datos o la relación seleccionada no existe.",
      409,
    );
  if (code === "23514" || code === "22P02" || code === "42P08")
    return response("Datos inválidos.", 400);
  return response("No se pudo completar la operación.", 500);
}

// Defensa extra contra CSRF: las peticiones que modifican datos
// deben venir de este mismo sitio.
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

async function access(resource: string, mode: Mode) {
  const session = await requireAdmin();
  if (!session) return { session: null, error: response("No autorizado", 401) };

  const config = Object.prototype.hasOwnProperty.call(RESOURCES, resource)
    ? RESOURCES[resource]
    : null;
  if (!config) {
    console.error("[ADMIN API] Recurso no registrado:", resource);
    return { session: null, error: response(`Recurso inválido: ${resource}`, 404) };
  }

  if (!config[mode].includes(session.role)) {
    return { session: null, error: response("Permisos insuficientes", 403) };
  }
  return { session, error: null };
}

// Tras cambiar contenido público, se invalida la caché del sitio.
function refreshPublicSite(resource: string) {
  if (resource !== "users") revalidatePath("/", "layout");
}

function positiveId(value: unknown) {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

function optionalId(value: unknown) {
  return value === "" || value === null || value === undefined
    ? null
    : positiveId(value);
}

function text(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function passwordInput(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function validRole(value: unknown): Role | null {
  return value === "SUPERADMIN" || value === "ADMIN" || value === "EDITOR"
    ? value
    : null;
}

// Ruta interna ("/imagen.jpg") o URL https. Rechaza "//otro-sitio.com".
function isSafeUrl(url: string) {
  return (url.startsWith("/") && !url.startsWith("//")) || /^https:\/\//i.test(url);
}

// Slug opcional enviado desde el formulario. Si no se envía, en las
// ediciones se conserva el actual para no romper enlaces ya publicados.
function customSlug(b: Record<string, unknown>) {
  const value = text(b.slug, 200);
  return value ? slugify(value) || null : null;
}

function seoValues(b: Record<string, unknown>) {
  const title = text(b.seo_title, 70) || null;
  const description = text(b.seo_description, 170) || null;
  const image = text(b.seo_image, 2000) || null;
  const canonical = text(b.seo_canonical, 2000) || null;

  if (image && !isSafeUrl(image))
    throw Object.assign(new Error("URL SEO inválida"), { code: "SEO_URL" });
  if (canonical && !/^https:\/\//i.test(canonical))
    throw Object.assign(new Error("La URL canónica debe comenzar con https://"), {
      code: "SEO_URL",
    });

  return [title, description, image, canonical];
}

function userFields(b: Record<string, unknown>) {
  const name = text(b.name, 150);
  const username = text(b.username, 80);
  const email = text(b.email, 180).toLowerCase();
  const role = validRole(b.role);
  if (name.length < 2 || username.length < 3 || !/^\S+@\S+\.\S+$/.test(email) || !role)
    return null;
  return { name, username, email, role };
}

async function readBody(req: Request) {
  const b = await req.json().catch(() => null);
  return b && typeof b === "object" && !Array.isArray(b)
    ? (b as Record<string, unknown>)
    : null;
}

export async function GET(_req: Request, { params }: Ctx) {
  const { resource } = await params;
  const { error } = await access(resource, "read");
  if (error) return error;

  try {
    const sql: Record<string, string> = {
      destinations: `SELECT d.*, p.name AS province_name, c.name AS category_name
        FROM destinations d
        JOIN provinces p ON p.id = d.province_id
        LEFT JOIN categories c ON c.id = d.category_id
        ORDER BY d.updated_at DESC`,
      categories: `SELECT * FROM categories ORDER BY name`,
      provinces: `SELECT * FROM provinces ORDER BY name`,
      districts: `SELECT d.*, p.name AS province_name
        FROM districts d
        JOIN provinces p ON p.id = d.province_id
        ORDER BY p.name, d.name`,
      articles: `SELECT a.*, u.name AS author_name, c.name AS category_name, p.name AS province_name
        FROM articles a
        LEFT JOIN users u ON u.id = a.author_id
        LEFT JOIN categories c ON c.id = a.category_id
        LEFT JOIN provinces p ON p.id = a.province_id
        ORDER BY a.updated_at DESC`,
      users: `SELECT id, name, username, email, role, active, created_at FROM users ORDER BY name`,
      ads: `SELECT * FROM ad_placements ORDER BY id`,
      gallery: `SELECT i.*, d.name AS destination_name
        FROM destination_images i
        JOIN destinations d ON d.id = i.destination_id
        ORDER BY d.name, i.sort_order, i.id`,
    };
    const { rows } = await query(sql[resource]);
    return NextResponse.json(rows);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return response("Origen no permitido", 403);
  const { resource } = await params;
  const { session, error } = await access(resource, "write");
  if (error || !session) return error;

  try {
    const b = await readBody(req);
    if (!b) return response("Datos inválidos", 400);

    let created: Record<string, unknown> | undefined;

    if (resource === "destinations") {
      const p = destinationSchema.safeParse(b);
      if (!p.success)
        return response("Revisa los datos del destino (nombre, provincia y descripción).", 400);
      const d = p.data;

      const district = optionalId(d.district_id);
      if (district) {
        const check = await query(
          "SELECT id FROM districts WHERE id = $1 AND province_id = $2",
          [district, d.province_id],
        );
        if (!check.rowCount)
          return response("El distrito no pertenece a la provincia seleccionada.", 400);
      }

      const r = await query(
        `INSERT INTO destinations (
           name, slug, province_id, district_id, category_id, excerpt, description,
           address, latitude, longitude, cover_image, status, featured, published_at,
           seo_title, seo_description, seo_image, seo_canonical
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
           CASE WHEN $12::varchar = 'PUBLISHED' THEN NOW() ELSE NULL END,
           $14, $15, $16, $17
         ) RETURNING *`,
        [
          d.name,
          customSlug(b) ?? slugify(d.name),
          d.province_id,
          district,
          optionalId(d.category_id),
          d.excerpt || null,
          d.description,
          d.address || null,
          d.latitude === "" ? null : (d.latitude ?? null),
          d.longitude === "" ? null : (d.longitude ?? null),
          d.cover_image || null,
          d.status,
          !!d.featured,
          ...seoValues(b),
        ],
      );
      created = r.rows[0];
    } else if (resource === "articles") {
      const p = articleSchema.safeParse(b);
      if (!p.success) {
        console.error("[ARTICLES] Errores de validación:", p.error.flatten());
        return NextResponse.json(
          {
            error: "Revisa los datos del artículo.",
            details: p.error.issues.map((issue) => ({
              campo: issue.path.join("."),
              mensaje: issue.message,
              codigo: issue.code,
            })),
          },
          { status: 400 },
        );
      }
      const d = p.data;

      const r = await query(
        `INSERT INTO articles (
           author_id, category_id, province_id, title, slug, excerpt,
           content, cover_image, status, featured, published_at,
           seo_title, seo_description, seo_image, seo_canonical
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
           CASE WHEN $9::varchar = 'PUBLISHED' THEN NOW() ELSE NULL END,
           $11, $12, $13, $14
         ) RETURNING *`,
        [
          session.userId,
          optionalId(d.category_id),
          optionalId(d.province_id),
          d.title,
          customSlug(b) ?? slugify(d.title),
          d.excerpt || null,
          d.content,
          d.cover_image || null,
          d.status,
          !!d.featured,
          ...seoValues(b),
        ],
      );
      created = r.rows[0];
    } else if (resource === "categories" || resource === "provinces") {
      const name = text(b.name, 120);
      if (name.length < 2)
        return response("El nombre debe tener al menos 2 caracteres.", 400);
      const slug = customSlug(b) ?? slugify(name);

      const r =
        resource === "categories"
          ? await query(
              `INSERT INTO categories (name, slug, description, seo_title, seo_description, seo_image, seo_canonical)
               VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
              [name, slug, text(b.description, 5000) || null, ...seoValues(b)],
            )
          : await query(
              "INSERT INTO provinces (name, slug, description) VALUES ($1, $2, $3) RETURNING *",
              [name, slug, text(b.description, 5000) || null],
            );
      created = r.rows[0];
    } else if (resource === "districts") {
      const name = text(b.name, 120);
      const province = positiveId(b.province_id);
      if (name.length < 2 || !province) return response("Indica provincia y nombre.", 400);

      const r = await query(
        "INSERT INTO districts (province_id, name, slug) VALUES ($1, $2, $3) RETURNING *",
        [province, name, customSlug(b) ?? slugify(name)],
      );
      created = r.rows[0];
    } else if (resource === "gallery") {
      const dest = positiveId(b.destination_id);
      const url = text(b.image_url, 1000);
      const order = Number(b.sort_order || 0);
      if (!dest || !isSafeUrl(url) || !Number.isSafeInteger(order))
        return response("Selecciona un destino, una URL válida y un orden entero.", 400);

      const r = await query(
        `INSERT INTO destination_images (destination_id, image_url, alt_text, caption, sort_order)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [dest, url, text(b.alt_text, 250) || null, text(b.caption, 250) || null, order],
      );
      created = r.rows[0];
    } else if (resource === "users") {
      const f = userFields(b);
      const password = passwordInput(b.password);
      if (!f || password.length < 10)
        return response(
          "Nombre, usuario, correo, rol y contraseña de 10 caracteres como mínimo son obligatorios.",
          400,
        );
      if (f.role === "SUPERADMIN" && session.role !== "SUPERADMIN")
        return response("Solo SUPERADMIN puede asignar ese rol.", 403);

      const hash = await bcrypt.hash(password, 12);
      const r = await query(
        `INSERT INTO users (name, username, email, password_hash, role, active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, username, email, role, active`,
        [f.name, f.username, f.email, hash, f.role, b.active !== false],
      );
      created = r.rows[0];
    } else if (resource === "ads") {
      const name = text(b.name, 120);
      const location = text(b.location, 80);
      if (!name || !location) return response("Nombre e identificador son obligatorios.", 400);

      const r = await query(
        "INSERT INTO ad_placements (name, location, ad_code, active) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, location, text(b.ad_code, 10000) || null, !!b.active],
      );
      created = r.rows[0];
    } else {
      return response("Recurso inválido", 404);
    }

    refreshPublicSite(resource);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return response("Origen no permitido", 403);
  const { resource } = await params;
  const { session, error } = await access(resource, "write");
  if (error || !session) return error;

  try {
    const b = await readBody(req);
    if (!b) return response("Datos inválidos", 400);
    const id = positiveId(b.id);
    if (!id) return response("ID inválido", 400);

    let r: { rows: Record<string, unknown>[] };

    if (resource === "destinations") {
      const p = destinationSchema.safeParse(b);
      if (!p.success) return response("Datos del destino inválidos", 400);
      const d = p.data;

      const district = optionalId(d.district_id);
      if (district) {
        const check = await query(
          "SELECT id FROM districts WHERE id = $1 AND province_id = $2",
          [district, d.province_id],
        );
        if (!check.rowCount)
          return response("El distrito no pertenece a la provincia seleccionada.", 400);
      }

      r = await query(
        `UPDATE destinations SET
           name = $1, slug = COALESCE($2, slug), province_id = $3, district_id = $4,
           category_id = $5, excerpt = $6, description = $7, address = $8,
           latitude = $9, longitude = $10, cover_image = $11, status = $12, featured = $13,
           seo_title = $15, seo_description = $16, seo_image = $17, seo_canonical = $18,
           published_at = CASE WHEN $12::varchar = 'PUBLISHED' THEN COALESCE(published_at, NOW()) ELSE NULL END,
           updated_at = NOW()
         WHERE id = $14
         RETURNING *`,
        [
          d.name,
          customSlug(b),
          d.province_id,
          district,
          optionalId(d.category_id),
          d.excerpt || null,
          d.description,
          d.address || null,
          d.latitude === "" ? null : (d.latitude ?? null),
          d.longitude === "" ? null : (d.longitude ?? null),
          d.cover_image || null,
          d.status,
          !!d.featured,
          id,
          ...seoValues(b),
        ],
      );
    } else if (resource === "articles") {
      const p = articleSchema.safeParse(b);
      if (!p.success) return response("Datos del artículo inválidos", 400);
      const d = p.data;

      // Un EDITOR solo puede modificar sus propios artículos.
      const onlyAuthor = session.role === "EDITOR" ? session.userId : null;

      r = await query(
        `UPDATE articles SET
           title = $1, slug = COALESCE($2, slug), category_id = $3, excerpt = $4,
           content = $5, cover_image = $6, status = $7, featured = $8, province_id = $10,
           seo_title = $11, seo_description = $12, seo_image = $13, seo_canonical = $14,
           published_at = CASE WHEN $7::varchar = 'PUBLISHED' THEN COALESCE(published_at, NOW()) ELSE NULL END,
           updated_at = NOW()
         WHERE id = $9 AND ($15::bigint IS NULL OR author_id = $15::bigint)
         RETURNING *`,
        [
          d.title,
          customSlug(b),
          optionalId(d.category_id),
          d.excerpt || null,
          d.content,
          d.cover_image || null,
          d.status,
          !!d.featured,
          id,
          optionalId(d.province_id),
          ...seoValues(b),
          onlyAuthor,
        ],
      );
    } else if (resource === "categories") {
      const name = text(b.name, 120);
      if (name.length < 2) return response("Nombre inválido", 400);
      r = await query(
        `UPDATE categories SET
           name = $1, slug = COALESCE($2, slug), description = $3, active = $4,
           seo_title = $6, seo_description = $7, seo_image = $8, seo_canonical = $9
         WHERE id = $5
         RETURNING *`,
        [name, customSlug(b), text(b.description, 5000) || null, b.active !== false, id, ...seoValues(b)],
      );
    } else if (resource === "provinces") {
      const name = text(b.name, 120);
      if (name.length < 2) return response("Nombre inválido", 400);
      r = await query(
        "UPDATE provinces SET name = $1, slug = COALESCE($2, slug), description = $3 WHERE id = $4 RETURNING *",
        [name, customSlug(b), text(b.description, 5000) || null, id],
      );
    } else if (resource === "districts") {
      const name = text(b.name, 120);
      const province = positiveId(b.province_id);
      if (name.length < 2 || !province) return response("Datos inválidos", 400);
      r = await query(
        "UPDATE districts SET province_id = $1, name = $2, slug = COALESCE($3, slug) WHERE id = $4 RETURNING *",
        [province, name, customSlug(b), id],
      );
    } else if (resource === "gallery") {
      const dest = positiveId(b.destination_id);
      const url = text(b.image_url, 1000);
      const order = Number(b.sort_order || 0);
      if (!dest || !isSafeUrl(url) || !Number.isSafeInteger(order))
        return response("Datos inválidos", 400);
      r = await query(
        `UPDATE destination_images
         SET destination_id = $1, image_url = $2, alt_text = $3, caption = $4, sort_order = $5
         WHERE id = $6
         RETURNING *`,
        [dest, url, text(b.alt_text, 250) || null, text(b.caption, 250) || null, order, id],
      );
    } else if (resource === "users") {
      const f = userFields(b);
      if (!f) return response("Datos de usuario inválidos", 400);
      const active = b.active !== false;

      const existing = await query<{ role: string }>("SELECT role FROM users WHERE id = $1", [id]);
      if (!existing.rowCount) return response("Usuario no encontrado", 404);

      if (
        session.role !== "SUPERADMIN" &&
        (f.role === "SUPERADMIN" || existing.rows[0].role === "SUPERADMIN")
      )
        return response("Solo SUPERADMIN puede modificar superadministradores.", 403);

      if (String(id) === session.userId && (!active || f.role !== session.role))
        return response("No puedes desactivar tu cuenta ni cambiar tu propio rol.", 400);

      const password = passwordInput(b.password);
      if (password && password.length < 10)
        return response("La contraseña nueva debe tener al menos 10 caracteres.", 400);
      const hash = password ? await bcrypt.hash(password, 12) : null;

      // Al cambiar la contraseña se cierran todas las sesiones de ese usuario.
      r = await query(
        `UPDATE users SET
           name = $1, username = $2, email = $3, role = $4, active = $5,
           password_hash = COALESCE($6::text, password_hash),
           session_version = session_version + CASE WHEN $6::text IS NULL THEN 0 ELSE 1 END
         WHERE id = $7
         RETURNING id, name, username, email, role, active`,
        [f.name, f.username, f.email, f.role, active, hash, id],
      );
    } else if (resource === "ads") {
      const name = text(b.name, 120);
      const location = text(b.location, 80);
      if (!name || !location) return response("Datos inválidos", 400);
      r = await query(
        "UPDATE ad_placements SET name = $1, location = $2, ad_code = $3, active = $4 WHERE id = $5 RETURNING *",
        [name, location, text(b.ad_code, 10000) || null, !!b.active, id],
      );
    } else {
      return response("Recurso inválido", 404);
    }

    if (!r.rows[0]) return response("Registro no encontrado", 404);
    refreshPublicSite(resource);
    return NextResponse.json(r.rows[0]);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return response("Origen no permitido", 403);
  const { resource } = await params;
  const { session, error } = await access(resource, "write");
  if (error || !session) return error;

  const id = positiveId(new URL(req.url).searchParams.get("id"));
  if (!id) return response("ID inválido", 400);

  if (resource === "users" && String(id) === session.userId)
    return response("No puedes eliminar tu propia cuenta.", 400);

  try {
    if (resource === "users" && session.role !== "SUPERADMIN") {
      const u = await query<{ role: string }>("SELECT role FROM users WHERE id = $1", [id]);
      if (u.rows[0]?.role === "SUPERADMIN")
        return response("No puedes eliminar un superadministrador.", 403);
    }

    // El nombre de la tabla sale de RESOURCES, nunca de la petición.
    const table = RESOURCES[resource].table;
    const r =
      resource === "articles" && session.role === "EDITOR"
        ? await query("DELETE FROM articles WHERE id = $1 AND author_id = $2 RETURNING id", [
            id,
            session.userId,
          ])
        : await query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [id]);

    if (!r.rowCount) return response("Registro no encontrado", 404);
    refreshPublicSite(resource);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}