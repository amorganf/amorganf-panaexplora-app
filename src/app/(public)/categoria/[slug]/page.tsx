import { seoMetadata } from "../../../lib/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { query } from "../../../lib/db";
import ArticleListing from "../../../components/public/ArticleListing";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
async function category(slug: string) {
  const r = await query<{
    id: string;
    name: string;
    description: string | null;
    seo_title: string | null;
    seo_description: string | null;
    seo_image: string | null;
    seo_canonical: string | null;
  }>(
    "SELECT id,name,description FROM categories WHERE slug=$1 AND active=TRUE LIMIT 1",
    [slug],
  );
  return r.rows[0];
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await category((await params).slug);
  return c
    ? seoMetadata(c, {
        title: c.name,
        description: c.description || `Artículos de ${c.name}`,
        path: `/categoria/${(await params).slug}`,
      })
    : { title: "Categoría no encontrada", robots: { index: false } };
}
export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const c = await category(slug);
  if (!c) notFound();
  return (
    <main>
      <ArticleListing
        searchParams={searchParams}
        path={`/categoria/${encodeURIComponent(slug)}`}
        fixedCategoryId={String(c.id)}
        heading={c.name}
        intro={
          c.description ||
          `Todos los artículos de ${c.name}. Busca y filtra por ubicación.`
        }
      />
    </main>
  );
}
