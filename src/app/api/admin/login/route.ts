import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { query } from "@/lib/db";
import { createSession } from "@/lib/auth";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

// Hash ficticio: si el usuario no existe se compara igualmente, para que
// la respuesta tarde lo mismo y no revele qué usuarios existen.
const DUMMY_HASH = bcrypt.hashSync("usuario-inexistente", 10);

const schema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200),
});

type UserRow = {
  id: string;
  password_hash: string;
  active: boolean;
  session_version: number;
  failed_logins: number;
  locked_until: Date | null;
};

const invalid = () =>
  NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Completa usuario y contraseña." },
        { status: 400 },
      );
    }
    const { username, password } = parsed.data;

    const { rows } = await query<UserRow>(
      `SELECT id, password_hash, active, session_version, failed_logins, locked_until
       FROM users
       WHERE username = $1`,
      [username],
    );
    const user = rows[0];

    if (user?.locked_until && user.locked_until > new Date()) {
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Inténtalo de nuevo en ${LOCK_MINUTES} minutos.`,
        },
        { status: 429 },
      );
    }

    // Siempre se compara la contraseña, exista o no el usuario.
    const passwordOk = await bcrypt.compare(
      password,
      user?.password_hash ?? DUMMY_HASH,
    );

    if (!user || !passwordOk || !user.active) {
      if (user) {
        await query(
          `UPDATE users
           SET failed_logins = failed_logins + 1,
               locked_until = CASE
                 WHEN failed_logins + 1 >= $2
                 THEN NOW() + make_interval(mins => $3)
                 ELSE locked_until
               END
           WHERE id = $1`,
          [user.id, MAX_ATTEMPTS, LOCK_MINUTES],
        );
      }
      return invalid();
    }

    await query(
      "UPDATE users SET failed_logins = 0, locked_until = NULL WHERE id = $1",
      [user.id],
    );
    await createSession({
      id: user.id,
      session_version: user.session_version,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ADMIN LOGIN]", error);
    return NextResponse.json(
      { error: "Error interno al iniciar sesión." },
      { status: 500 },
    );
  }
}