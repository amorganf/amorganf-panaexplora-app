import type { Metadata } from "next";
import { getSettings } from "../../../lib/data/settings";

// Solo los campos que contienen textos legales.
// Ajusta los nombres a los de tu tabla de ajustes.
export type LegalField =
  "privacy_policy" | "cookie_policy" | "terms_conditions";

async function getLegalText(field: LegalField) {
  const s = await getSettings();
  const value = s[field];
  return typeof value === "string" ? value.trim() : "";
}

// Metadatos para la página: si el texto aún no existe, no se indexa.
export async function legalMetadata(
  field: LegalField,
  title: string,
  path: string,
): Promise<Metadata> {
  const text = await getLegalText(field);
  return {
    title,
    alternates: { canonical: path },
    robots: text ? undefined : { index: false, follow: true },
  };
}

export default async function LegalPage({
  title,
  field,
}: {
  title: string;
  field: LegalField;
}) {
  const text = await getLegalText(field);

  // Cada línea en blanco separa un párrafo; los saltos simples se respetan.
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main className="container section-space" style={{ maxWidth: 850 }}>
      <article>
        <h1 className="display-6 fw-bold mb-4">{title}</h1>
        {paragraphs.length > 0 ? (
          <div style={{ lineHeight: 1.8 }}>
            {paragraphs.map((p, i) => (
              <p key={i} style={{ whiteSpace: "pre-line" }}>
                {p}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-secondary">
            Contenido pendiente de revisión y publicación por el responsable de
            PanaExplora.
          </p>
        )}
      </article>
    </main>
  );
}
