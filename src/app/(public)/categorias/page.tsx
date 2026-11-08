import Link from "next/link";
import { query } from "../../lib/db";
export const dynamic = "force-dynamic";
export default async function CategoriesPage() {
  const r = await query<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    total: string;
  }>(
    "SELECT c.id,c.name,c.slug,c.description,COUNT(a.id)::text AS total FROM categories c LEFT JOIN articles a ON a.category_id=c.id AND a.status='PUBLISHED' WHERE c.active=TRUE GROUP BY c.id ORDER BY c.name",
  );
  return (
    <main className="container section-space">
      <h1 className="display-5 fw-bold mb-4">Categorías</h1>
      <div className="row g-4">
        {r.rows.map((c) => (
          <div className="col-md-6 col-lg-4" key={c.id}>
            <Link
              href={`/categoria/${c.slug}`}
              className="d-block bg-light border rounded-4 p-2 h-100 text-decoration-none"
            >
              <h2 className="h4">{c.name}</h2>
              <p className="text-secondary">
                {c.description || "Explora nuestros artículos"}
              </p>
              <strong>{c.total} artículos</strong>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
