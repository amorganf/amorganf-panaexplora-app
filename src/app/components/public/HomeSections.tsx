import Image from "next/image";
import Link from "next/link";
import { query } from "../../lib/db";
import ArticleListing from "../public/ArticleListing";

type Search = Record<string, string | string[] | undefined>;

type Section = {
  section_key: string;
  title: string;
  enabled: boolean;
  sort_order: number;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  category_name: string | null;
};

type Category = { id: string; name: string; slug: string; count: string };

const plural = (n: string, singular: string, pluralWord: string) =>
  `${n} ${n === "1" ? singular : pluralWord}`;

export default async function HomeSections({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sections = await query<Section>(
    `SELECT section_key, title, enabled, sort_order
     FROM home_sections
     WHERE enabled = TRUE
     ORDER BY sort_order, section_key`,
  );

  const enabled = new Set(sections.rows.map((s) => s.section_key));

  const [featured, categories] = await Promise.all([
    enabled.has("featured")
      ? query<Article>(
          `SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image, c.name AS category_name
           FROM articles a
           LEFT JOIN categories c ON c.id = a.category_id
           WHERE a.status = 'PUBLISHED' AND a.featured = TRUE
           ORDER BY a.published_at DESC NULLS LAST, a.id DESC
           LIMIT 6`,
        )
      : Promise.resolve({ rows: [] as Article[] }),
    enabled.has("categories")
      ? query<Category>(
          `SELECT c.id, c.name, c.slug, COUNT(a.id)::text AS count
           FROM categories c
           JOIN articles a ON a.category_id = c.id AND a.status = 'PUBLISHED'
           WHERE c.active = TRUE
           GROUP BY c.id, c.name, c.slug
           HAVING COUNT(a.id) > 0
           ORDER BY c.name`,
        )
      : Promise.resolve({ rows: [] as Category[] }),
  ]);

  if (sections.rows.length === 0) {
    return (
      <main className="container section-space text-center">
        <h1 className="display-5 fw-bold">PanaExplora</h1>
        <p className="text-secondary my-4">
          Playas, montañas, cultura y experiencias para tu próxima aventura.
        </p>
        <Link href="/blog" className="btn btn-brand btn-lg rounded-pill px-4">
          Explorar artículos
        </Link>
      </main>
    );
  }

  return (
    <main>
      {sections.rows.map((section) => {
        switch (section.section_key) {
          case "hero":
            return (
              <section key="hero" className="hero">
                <div className="container py-5">
                  <span className="badge rounded-pill text-bg-light mb-4 px-3 py-2">
                    Descubre Panamá
                  </span>
                  <h1>{section.title}</h1>
                  <p className="my-4">
                    Playas, montañas, cultura y experiencias para tu próxima
                    aventura.
                  </p>
                  <Link
                    href="/blog"
                    className="btn btn-brand btn-lg rounded-pill px-4"
                  >
                    Explorar artículos
                  </Link>
                </div>
              </section>
            );

          case "featured":
            return (
              <section key="featured" className="container section-space">
                <h2 className="display-6 fw-bold mb-4">{section.title}</h2>
                {featured.rows.length > 0 ? (
                  <div className="row g-4">
                    {featured.rows.map((a) => (
                      <div className="col-md-6 col-lg-4" key={a.id}>
                        <article className="card destination-card h-100 position-relative">
                          {a.cover_image ? (
                            <div
                              className="position-relative card-img-top overflow-hidden"
                              style={{ aspectRatio: "16 / 10" }}
                            >
                              <Image
                                src={a.cover_image}
                                alt=""
                                fill
                                sizes="(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw"
                                className="object-fit-cover"
                              />
                            </div>
                          ) : (
                            <div className="article-placeholder">
                              PanaExplora
                            </div>
                          )}
                          <div className="card-body d-flex flex-column">
                            <div className="small fw-bold text-uppercase mb-2">
                              {a.category_name || "Artículo destacado"}
                            </div>
                            <h3 className="h5 fw-bold">
                              <Link
                                href={`/blog/${a.slug}`}
                                className="stretched-link text-decoration-none"
                              >
                                {a.title}
                              </Link>
                            </h3>
                            {a.excerpt && (
                              <p className="text-secondary">{a.excerpt}</p>
                            )}
                            <span className="mt-auto fw-bold text-primary">
                              Leer artículo
                            </span>
                          </div>
                        </article>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary">
                    Aún no hay artículos destacados publicados.
                  </p>
                )}
              </section>
            );

          case "categories":
            return (
              <section key="categories" className="container section-space">
                <h2 className="display-6 fw-bold mb-4">{section.title}</h2>
                {categories.rows.length > 0 ? (
                  <div className="row g-3">
                    {categories.rows.map((c) => (
                      <div key={c.id} className="col-sm-6 col-lg-3">
                        <Link
                          href={`/categoria/${c.slug}`}
                          className="d-block bg-light border rounded-4 p-4 h-100 text-decoration-none"
                        >
                          <h3 className="h5 fw-bold">{c.name}</h3>
                          <span className="text-secondary">
                            {plural(c.count, "artículo", "artículos")}
                          </span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary">
                    Aún no hay categorías con artículos publicados.
                  </p>
                )}
              </section>
            );

          case "latest":
            return (
              <ArticleListing
                key="latest"
                searchParams={searchParams}
                path="/"
                heading={section.title}
                intro="Busca por tema, categoría o provincia. Todos los artículos publicados, con paginación."
              />
            );

          default:
            return null;
        }
      })}
    </main>
  );
}
