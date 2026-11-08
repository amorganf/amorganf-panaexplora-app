import Link from "next/link";
import { query } from "../../lib/db";

type Search = Record<string, string | string[] | undefined>;
type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  category_name: string | null;
  province_name: string | null;
  published_at: Date | null;
};
type Option = { id: string; name: string };
const PAGE_SIZE = 9;
function value(input: string | string[] | undefined) {
  return typeof input === "string" ? input.trim() : "";
}
function buildUrl(
  path: string,
  q: string,
  category: string,
  province: string,
  page: number,
) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (category && !path.startsWith("/categoria/")) p.set("categoria", category);
  if (province) p.set("provincia", province);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `${path}?${s}` : path;
}
export default async function ArticleListing({
  searchParams,
  path = "/",
  heading = "Explora nuestros artículos",
  intro = "Encuentra experiencias, recomendaciones y guías para descubrir Panamá.",
  fixedCategoryId,
}: {
  searchParams: Promise<Search>;
  path?: string;
  heading?: string;
  intro?: string;
  fixedCategoryId?: string;
}) {
  const sp = await searchParams;
  const q = value(sp.q).slice(0, 120),
    category = value(sp.categoria),
    province = value(sp.provincia);
  const categoryId =
    fixedCategoryId || (/^[1-9]\d*$/.test(category) ? category : "");
  const provinceId = /^[1-9]\d*$/.test(province) ? province : "";
  const requestedPage = Number(value(sp.page));
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, 100000)
      : 1;
  const [cats, provs] = await Promise.all([
    query<Option>(
      "SELECT id,name FROM categories WHERE active=TRUE ORDER BY name",
    ),
    query<Option>("SELECT id,name FROM provinces ORDER BY name"),
  ]);
  const filters: string[] = ["a.status='PUBLISHED'"];
  const params: unknown[] = [];
  if (q) {
    params.push(`%${q}%`);
    filters.push(
      `(a.title ILIKE $${params.length} OR COALESCE(a.excerpt,'') ILIKE $${params.length} OR a.content ILIKE $${params.length})`,
    );
  }
  if (categoryId) {
    params.push(categoryId);
    filters.push(`a.category_id=$${params.length}::bigint`);
  }
  if (provinceId) {
    params.push(provinceId);
    filters.push(`a.province_id=$${params.length}::bigint`);
  }
  const where = filters.join(" AND ");
  const totalResult = await query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM articles a WHERE ${where}`,
    params,
  );
  const total = Number(totalResult.rows[0]?.total || 0),
    pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pages);
  const result = await query<Article>(
    `SELECT a.id,a.title,a.slug,a.excerpt,a.cover_image,a.published_at,c.name AS category_name,p.name AS province_name FROM articles a LEFT JOIN categories c ON c.id=a.category_id LEFT JOIN provinces p ON p.id=a.province_id WHERE ${where} ORDER BY a.published_at DESC NULLS LAST,a.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, PAGE_SIZE, (current - 1) * PAGE_SIZE],
  );
  const start = Math.max(1, current - 2),
    end = Math.min(pages, current + 2);
  return (
    <section className="container section-space" id="articulos">
      <div className="section-kicker">Panamá por Descubrir</div>
      <h2 className="display-6 fw-bold mt-2">{heading}</h2>
      <p className="text-secondary mb-4">{intro}</p>
      <form
        action={path}
        method="GET"
        className="row g-3 align-items-end bg-light rounded-4 p-3 p-md-4 mb-4"
        role="search"
      >
        <div className="col-lg-5">
          <label htmlFor="buscar-articulos" className="form-label fw-semibold">
            Buscar artículos
          </label>
          <input
            id="buscar-articulos"
            name="q"
            className="form-control"
            placeholder="Ej.: playas, montañas, gastronomía"
            defaultValue={q}
            maxLength={120}
          />
        </div>
        {!fixedCategoryId && (
          <div className="col-md-4 col-lg-3">
            <label
              htmlFor="filtro-categoria"
              className="form-label fw-semibold"
            >
              Categoría
            </label>
            <select
              id="filtro-categoria"
              name="categoria"
              className="form-select"
              defaultValue={categoryId}
            >
              <option value="">Todas las categorías</option>
              {cats.rows.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="col-md-4 col-lg-2">
          <label htmlFor="filtro-provincia" className="form-label fw-semibold">
            Ubicación
          </label>
          <select
            id="filtro-provincia"
            name="provincia"
            className="form-select"
            defaultValue={provinceId}
          >
            <option value="">Todo Panamá</option>
            {provs.rows.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4 col-lg-2 d-flex gap-2">
          <button className="btn btn-brand flex-grow-1" type="submit">
            Filtrar
          </button>
          <Link
            className="btn btn-outline-secondary"
            href={path}
            aria-label="Limpiar filtros"
          >
            ✕
          </Link>
        </div>
      </form>
      <p className="text-secondary small" aria-live="polite">
        {total} {total === 1 ? "artículo encontrado" : "artículos encontrados"}
        {total > 0 ? ` · Página ${current} de ${pages}` : ""}
      </p>
      <div className="row g-4">
        {result.rows.map((a) => (
          <div className="col-md-6 col-lg-4" key={a.id}>
            <article className="card destination-card h-100">
              {a.cover_image ? (
                <img src={a.cover_image} alt={a.title} loading="lazy" />
              ) : (
                <div className="article-placeholder">Panamá por Descubrir</div>
              )}
              <div className="card-body d-flex flex-column">
                <div
                  className="small fw-bold text-uppercase mb-2"
                  style={{ color: "var(--brand)" }}
                >
                  {a.category_name || "Sin categoría"}
                  {a.province_name ? ` · ${a.province_name}` : ""}
                </div>
                <h3 className="h5 fw-bold">
                  <Link href={`/blog/${a.slug}`}>{a.title}</Link>
                </h3>
                <p className="text-secondary">
                  {a.excerpt ||
                    "Descubre más sobre este destino y sus experiencias."}
                </p>
                <Link
                  href={`/blog/${a.slug}`}
                  className="fw-bold mt-auto"
                  style={{ color: "var(--brand)" }}
                >
                  Leer artículo →
                </Link>
              </div>
            </article>
          </div>
        ))}
        {!result.rows.length && (
          <div className="col-12">
            <div className="alert alert-light border">
              No encontramos artículos con esos filtros. Prueba otra búsqueda o{" "}
              <Link href={path}>limpia los filtros</Link>.
            </div>
          </div>
        )}
      </div>
      {pages > 1 && (
        <nav aria-label="Paginación de artículos" className="mt-5">
          <ul className="pagination justify-content-center flex-wrap gap-1">
            <li className={`page-item ${current === 1 ? "disabled" : ""}`}>
              <Link
                className="page-link"
                aria-disabled={current === 1}
                tabIndex={current === 1 ? -1 : undefined}
                href={buildUrl(
                  path,
                  q,
                  categoryId,
                  provinceId,
                  Math.max(1, current - 1),
                )}
              >
                Anterior
              </Link>
            </li>
            {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
              (n) => (
                <li
                  key={n}
                  className={`page-item ${n === current ? "active" : ""}`}
                >
                  <Link
                    className="page-link"
                    aria-current={n === current ? "page" : undefined}
                    href={buildUrl(path, q, categoryId, provinceId, n)}
                  >
                    {n}
                  </Link>
                </li>
              ),
            )}
            <li className={`page-item ${current === pages ? "disabled" : ""}`}>
              <Link
                className="page-link"
                aria-disabled={current === pages}
                tabIndex={current === pages ? -1 : undefined}
                href={buildUrl(
                  path,
                  q,
                  categoryId,
                  provinceId,
                  Math.min(pages, current + 1),
                )}
              >
                Siguiente
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </section>
  );
}
