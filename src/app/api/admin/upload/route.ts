import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File))
      return NextResponse.json(
        { error: "Selecciona una imagen." },
        { status: 400 },
      );
    if (
      !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
        file.type,
      )
    )
      return NextResponse.json(
        { error: "Formato permitido: JPG, PNG, WEBP o AVIF." },
        { status: 400 },
      );
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json(
        { error: "La imagen no puede superar 5 MB." },
        { status: 400 },
      );
    const ext = (
      {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/avif": "avif",
      } as Record<string, string>
    )[file.type];
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await writeFile(
      path.join(dir, name),
      Buffer.from(await file.arrayBuffer()),
    );
    return NextResponse.json({ url: `/uploads/${name}` }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo subir la imagen." },
      { status: 500 },
    );
  }
}
