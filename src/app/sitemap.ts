import type { MetadataRoute } from "next";
import { query } from "../lib/db";

export const revalidate = 3600;

type Row = { slug: string; updated_at: Date | null };

const latest = (rows: Row[]) =>
  rows.reduce<Date | undefined>(
    (max, r) =>
      r.updated_at && (!max || r.updated_at > max) ? r.updated_at : max,
    undefined,
  );

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  const [d, a, c] = await Promise.all([
    query<Row>(
      `SELECT slug, updated_at FROM destinations WHERE status = 'PUBLISHED'`,
    ),
    query<Row>(
      `SELECT slug, updated_at FROM articles WHERE status = 'PUBLISHED'`,
    ),
    query<{ slug: string }>(`SELECT slug FROM categories WHERE active = TRUE`),
  ]);

  const lastDestino = latest(d.rows);
  const lastArticulo = latest(a.rows);
  const lastGeneral = [lastDestino, lastArticulo]
    .filter((x): x is Date => !!x)
    .sort((x, y) => y.getTime() - x.getTime())[0];

  return [
    { url: base, lastModified: lastGeneral },
    { url: `${base}/destinos`, lastModified: lastDestino },
    { url: `${base}/blog`, lastModified: lastArticulo },
    ...d.rows.map((x) => ({
      url: `${base}/destino/${encodeURIComponent(x.slug)}`,
      lastModified: x.updated_at ?? undefined,
    })),
    ...c.rows.map((x) => ({
      url: `${base}/categoria/${encodeURIComponent(x.slug)}`,
    })),
    ...a.rows.map((x) => ({
      url: `${base}/blog/${encodeURIComponent(x.slug)}`,
      lastModified: x.updated_at ?? undefined,
    })),
  ];
}
