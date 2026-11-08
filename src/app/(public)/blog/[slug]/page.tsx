import { seoMetadata, jsonLd, absoluteUrl } from "../../../lib/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { query } from "../../../lib/db";

type Props = { params: Promise<{ slug: string }> };
type A = {
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | null;
  seo_canonical: string | null;
  slug: string;
  updated_at: Date;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author_name: string;
  category_name: string | null;
  published_at: Date | null;
};

async function getArticle(slug: string) {
  const { rows } = await query<A>(
    `SELECT a.*,u.name AS author_name,c.name AS category_name FROM articles a JOIN users u ON u.id=a.author_id LEFT JOIN categories c ON c.id=a.category_id WHERE a.slug=$1 AND a.status='PUBLISHED'`,
    [slug],
  );
  return rows[0];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle(slug);
  return a
    ? seoMetadata(a, {
        title: a.title,
        description: a.excerpt || a.content.slice(0, 155),
        path: `/blog/${slug}`,
        image: a.cover_image,
      })
    : { title: "No encontrado", robots: { index: false } };
}
export default async function Article({ params }: Props) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.seo_description || a.excerpt || a.content.slice(0, 155),
    image: a.seo_image || a.cover_image || undefined,
    datePublished: a.published_at?.toISOString(),
    dateModified: a.updated_at?.toISOString(),
    author: { "@type": "Person", name: a.author_name },
    mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
  };
  return (
    <main className="container section-space" style={{ maxWidth: 900 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(ld) }}
      />
      <div className="section-kicker">
        {a.category_name || "Blog de viajes"}
      </div>
      <h1 className="display-5 fw-bold my-3">{a.title}</h1>
      <p className="lead text-secondary">{a.excerpt}</p>
      <p className="small text-secondary">
        Por {a.author_name}
        {a.published_at
          ? ` · ${new Date(a.published_at).toLocaleDateString("es-PA")}`
          : ""}
      </p>
      {a.cover_image && (
        <img
          src={a.cover_image}
          alt={a.title}
          className="w-100 rounded-4 my-4"
        />
      )}
      <article className="content-prose">{a.content}</article>
    </main>
  );
}
