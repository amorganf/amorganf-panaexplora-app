import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { z } from "zod";
const schema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.email().max(180),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).optional(),
});
export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json({ error: "Revisa los campos" }, { status: 400 });
    if (parsed.data.website) return NextResponse.json({ ok: true });
    const d = parsed.data;
    await query(
      "INSERT INTO contact_messages(name,email,subject,message) VALUES($1,$2,$3,$4)",
      [d.name, d.email, d.subject, d.message],
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[CONTACT]", e);
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje" },
      { status: 500 },
    );
  }
}
