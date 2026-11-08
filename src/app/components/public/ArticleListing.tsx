import Link from "next/link";
import { redirect } from "next/navigation";
import { query } from "../../lib/db";

import ArticleCard, {
  type ArticleCardData,
} from "./ArticleCard";

type Search = Record<string, string | string[] | undefined>;
type Article = ArticleCardData & { published_at: Date | null; total: string };
type Option = { id: string; name: string };

const PAGE_SIZE = 9;
const MAX_PAGE = 100_000;
const ID_RE = /^[1-9]\d*$/;

function value(input: string | string[] | undefined) {
  return typeof input === "string" ? input.trim() : "";
}

// En ILIKE, % y _ son comodines; se escapan para buscarlos literalmente.
function escapeLike(text: string) {
  return text.replace(/[\\%_]/g, "\\$&");
}

function buildUrl({
  path,
  q,
  category,
  province,
  page,
}: {
  path: string;
  q: string;
  category: string;
  province: string;
  page: number;
}) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (category) p.set("categoria", category);
  if (province) p.set("provincia", province);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return `${s ? `${path}?${s}` : path}#articulos`;
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

  // 1. Leer y validar los parámetros
  const q = value(sp.q).slice(0, 120);
  const rawCategory = value(sp.categoria);
  const rawProvince = value(sp.provincia);
  const urlCategoryId =
    !fixedCategoryId && ID_RE.test(rawCategory) ? rawCategory : "";
  const categoryId = fixedCategoryId || urlCategoryId;
  const provinceId = ID_RE.test(rawProvince) ? rawProvince : "";
  const requestedPage = Number(value(sp.page));
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, MAX_PAGE)
      : 1;

  // 2. Construir los filtros con parámetros
  const filters: string[] = ["a.status = 'PUBLISHED'"];
  const params: unknown[] = [];
  if (q) {
    params.push(`%${escapeLike(q)}%`);
    const n = params.length;
    filters.push(
      `(a.title ILIKE $${n} OR COALESCE(a.excerpt, '') ILIKE $${n} OR a.content ILIKE $${n})`,
    );
  }
  if (categoryId) {
    params.push(categoryId);
    filters.push(`a.category_id = $${params.length}::bigint`);
  }
  if (provinceId) {
    params.push(provinceId);
    filters.push(`a.province_id = $${params.length}::bigint`);
  }
  const where = filters.join(" AND ");

  // 3. Consultas en paralelo; el total viene en la misma consulta del listado
  const [cats, provs, list] = await Promise.all([
    fixedCategoryId
      ? Promise.resolve({ rows: [] as Option[] })
      : query<Option>(
          `SELECT c.id, c.name
           FROM categories c
           WHERE c.active = TRUE
             AND EXISTS (
               SELECT 1 FROM articles a
               WHERE a.category_id = c.id AND a.status = 'PUBLISHED'
             )
           ORDER BY c.name`,
        ),
    query<Option>(
      `SELECT p.id, p.name
       FROM provinces p
       WHERE EXISTS (
         SELECT 1 FROM articles a
         WHERE a.province_id = p.id AND a.status = 'PUBLISHED'
       )
       ORDER BY p.name`,
    ),
    query<Article>(
      `SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image, a.published_at,
              c.name AS category_name, p.name AS province_name,
              COUNT(*) OVER()::text AS total
       FROM articles a
       LEFT JOIN categories c ON c.id = a.category_id
       LEFT JOIN provinces p ON p.id = a.province_id
       WHERE ${where}
       ORDER BY a.published_at DESC NULLS LAST, a.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, PAGE_SIZE, (page - 1) * PAGE_SIZE],
    ),
  ]);

  let total = Number(list.rows[0]?.total ?? 0);
  // Página fuera de rango: no hay filas, así que el total se cuenta aparte.
  if (list.rows.length === 0 && page > 1) {
    const count = await query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM articles a WHERE ${where}`,
      params,
    );
    total = Number(count.rows[0]?.total ?? 0);
  }
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pages);

  const urlFor = (n: number) =>
    buildUrl({
      path,
      q,
      category: urlCategoryId,
      province: provinceId,
      page: n,
    });

  // 4. Normalizar la URL: quita parámetros vacíos o inválidos y corrige
  //    páginas fuera de rango, para no tener URLs duplicadas.
  const expected: Record<string, string | undefined> = {
    q: q || undefined,
    categoria: urlCategoryId || undefined,
    provincia: provinceId || undefined,
    page: current > 1 ? String(current) : undefined,
  };
  const isCanonical = Object.entries(expected).every(
    ([key, val]) => sp[key] === val,
  );
  if (!isCanonical) redirect(urlFor(current));

  const start = Math.max(1, current - 2);
  const end = Math.min(pages, current + 2);
  const pageNumbers = Array.from(
    { length: end - start + 1 },
    (_, i) => start + i,
  );

  return (
    <section className="container section-space" id="articulos">
      <div className="section-kicker">Panamá por Descubrir</div>
      <h2 className="display-6 fw-bold mt-2">{heading}</h2>
      <p className="text-secondary mb-4">{intro}</p>

      <form
        action={`${path}#articulos`}
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
            type="search"
            className="form-control"
            placeholder="Ej.: playas, montañas, gastronomía"
            defaultValue={q}
            maxLength={120}
          />
        </div>

        {!fixedCategoryId && (
          <div className="col-md-4 col-lg-3">
            <label htmlFor="filtro-categoria" className="form-label fw-semibold">
              Categoría
            </label>
            <select
              id="filtro-categoria"
              name="categoria"
              className="form-select"
              defaultValue={urlCategoryId}
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
            href={`${path}#articulos`}
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
        {list.rows.map((a) => (
          <div className="col-md-6 col-lg-4" key={a.id}>
            <ArticleCard
              article={a}
              fallbackExcerpt="Descubre más sobre este destino y sus experiencias."
            />
          </div>
        ))}
        {list.rows.length === 0 && (
          <div className="col-12">
            <div className="alert alert-light border">
              No encontramos artículos con esos filtros. Prueba otra búsqueda o{" "}
              <Link href={`${path}#articulos`}>limpia los filtros</Link>.
            </div>
          </div>
        )}
      </div>

      {pages > 1 && (
        <nav aria-label="Paginación de artículos" className="mt-5">
          <ul className="pagination justify-content-center flex-wrap gap-1">
            <PageItem
              label="Anterior"
              href={urlFor(current - 1)}
              disabled={current === 1}
            />
            {pageNumbers.map((n) => (
              <PageItem
                key={n}
                label={String(n)}
                href={urlFor(n)}
                active={n === current}
              />
            ))}
            <PageItem
              label="Siguiente"
              href={urlFor(current + 1)}
              disabled={current === pages}
            />
          </ul>
        </nav>
      )}
    </section>
  );
}

function PageItem({
  label,
  href,
  active = false,
  disabled = false,
}: {
  label: string;
  href: string;
  active?: boolean;
  disabled?: boolean;
}) {
  const state = active ? "active" : disabled ? "disabled" : "";
  return (
    <li className={`page-item ${state}`}>
      {disabled ? (
        <span className="page-link">{label}</span>
      ) : (
        <Link
          className="page-link"
          href={href}
          aria-current={active ? "page" : undefined}
        >
          {label}
        </Link>
      )}
    </li>
  );
}