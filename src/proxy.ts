import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
  SESSION_AUDIENCE,
  SESSION_COOKIE,
  SESSION_ISSUER,
} from "@/lib/session-config";

// Primera barrera, rápida: solo comprueba que haya un token firmado y válido.
// La comprobación completa (usuario activo, rol, sesión no revocada) la hacen
// las páginas y rutas con requireAdminOrRedirect y requireAdmin.
export async function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const loginUrl = new URL("/admin/login", req.url);
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret || secret.length < 32) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    if (typeof payload.sub !== "string" || typeof payload.v !== "number") {
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(loginUrl);
  }
}

export const config = { matcher: ["/admin/:path*"] };