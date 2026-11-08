import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { query } from "./db";

export type Role = "SUPERADMIN" | "ADMIN" | "EDITOR";
export const ALL_ROLES: readonly Role[] = ["SUPERADMIN", "ADMIN", "EDITOR"];

const isProd = process.env.NODE_ENV === "production";
// El prefijo __Host- obliga a que la cookie sea Secure, sin dominio y con path=/,
// lo que impide que un subdominio la sobrescriba. Solo en producción (HTTPS).
const COOKIE = isProd ? "__Host-ppd_session" : "ppd_session";
const MAX_AGE = 8 * 60 * 60; // 8 horas
const ISSUER = "panaexplora";
const AUDIENCE = "panaexplora-admin";

function getSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET debe tener al menos 32 caracteres.");
  }
  return new TextEncoder().encode(value);
}

// Solo puede llamarse desde una Server Action o un Route Handler.
export async function createSession(user: {
  id: string;
  session_version: number;
}) {
  const token = await new SignJWT({ v: user.session_version })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

// Verifica la firma y el formato del token. Una vez por petición.
const readToken = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (
      typeof payload.sub !== "string" ||
      !/^[1-9]\d*$/.test(payload.sub) ||
      typeof payload.v !== "number"
    ) {
      return null;
    }
    return { userId: payload.sub, version: payload.v };
  } catch {
    return null;
  }
});

// Usuario actual según la base de datos, que es la fuente de verdad
// para el rol y el estado. Una sola consulta por petición.
export const getCurrentUser = cache(async () => {
  const token = await readToken();
  if (!token) return null;

  const { rows } = await query<{
    id: string;
    name: string;
    role: Role;
    active: boolean;
    session_version: number;
  }>(
    "SELECT id, name, role, active, session_version FROM users WHERE id = $1",
    [token.userId],
  );

  const user = rows[0];
  if (
    !user ||
    !user.active ||
    user.session_version !== token.version ||
    !ALL_ROLES.includes(user.role)
  ) {
    return null;
  }
  return { userId: String(user.id), name: user.name, role: user.role };
});

// Devuelve el usuario si tiene uno de los roles indicados, o null.
export async function requireAdmin(roles: readonly Role[] = ALL_ROLES) {
  const user = await getCurrentUser();
  return user && roles.includes(user.role) ? user : null;
}

// Para páginas y Server Actions: si no hay permiso, redirige.
export async function requireAdminOrRedirect(
  roles: readonly Role[] = ALL_ROLES,
) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!roles.includes(user.role)) redirect("/admin");
  return user;
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

// Invalida todas las sesiones abiertas de un usuario, en cualquier dispositivo.
// Úsalo al cerrar sesión, al cambiar la contraseña o al desactivar una cuenta.
export async function revokeAllSessions(userId: string) {
  await query(
    "UPDATE users SET session_version = session_version + 1 WHERE id = $1",
    [userId],
  );
}
