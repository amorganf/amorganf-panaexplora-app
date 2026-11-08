import Image from "next/image";
import Link from "next/link";

export type ArticleCardData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  category_name: string | null;
  province_name?: string | null;
};

type Props = {
  article: ArticleCardData;
  fallbackCategory?: string;
  fallbackExcerpt?: string;
  placeholder?: string;
};

export default function ArticleCard({
  article: a,
  fallbackCategory = "Sin categoría",
  fallbackExcerpt,
  placeholder = "Panamá por Descubrir",
}: Props) {
  const meta = [a.category_name || fallbackCategory, a.province_name]
    .filter(Boolean)
    .join(" · ");
  const excerpt = a.excerpt || fallbackExcerpt;

  return (
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
        <div className="article-placeholder" aria-hidden="true">
          {placeholder}
        </div>
      )}
      <div className="card-body d-flex flex-column">
        <div
          className="small fw-bold text-uppercase mb-2"
          style={{ color: "var(--brand)" }}
        >
          {meta}
        </div>
        <h3 className="h5 fw-bold">
          <Link
            href={`/blog/${encodeURIComponent(a.slug)}`}
            className="stretched-link text-decoration-none text-body"
          >
            {a.title}
          </Link>
        </h3>
        {excerpt && <p className="text-secondary">{excerpt}</p>}
        <span
          className="mt-auto fw-bold"
          style={{ color: "var(--brand)" }}
          aria-hidden="true"
        >
          Leer artículo →
        </span>
      </div>
    </article>
  );
}