import { seoMetadata, jsonLd, absoluteUrl } from "../../../lib/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { query } from "../../../lib/db";
type Props = { params: Promise<{ slug: string }> };
type D = {
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | null;
  seo_canonical: string | null;
  id: number;
  name: string;
  slug: string;
  excerpt: string | null;
  description: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  cover_image: string | null;
  province_name: string;
  district_name: string | null;
  category_name: string | null;
};
async function getDestination(slug: string) {
  const { rows } = await query<D>(
    `SELECT d.*,p.name AS province_name,di.name AS district_name,c.name AS category_name FROM destinations d JOIN provinces p ON p.id=d.province_id LEFT JOIN districts di ON di.id=d.district_id LEFT JOIN categories c ON c.id=d.category_id WHERE d.slug=$1 AND d.status='PUBLISHED'`,
    [slug],
  );
  return rows[0];
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDestination(slug);
  return d
    ? seoMetadata(d, {
        title: d.name,
        description: d.excerpt || d.description.slice(0, 155),
        path: `/destino/${slug}`,
        image: d.cover_image,
      })
    : { title: "No encontrado", robots: { index: false } };
}
export default async function Detail({ params }: Props) {
  const { slug } = await params;
  const d = await getDestination(slug);
  if (!d) notFound();
  const ld = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: d.name,
    description: d.seo_description || d.excerpt || d.description.slice(0, 155),
    image: d.seo_image || d.cover_image || undefined,
    address: {
      "@type": "PostalAddress",
      addressRegion: d.province_name,
      addressCountry: "PA",
      streetAddress: d.address || undefined,
    },
    url: absoluteUrl(`/destino/${slug}`),
  };
  return (
    <main className="container section-space">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(ld) }}
      />
      <div className="small text-secondary mb-4">
        Panamá / {d.province_name} / {d.name}
      </div>
      {d.cover_image && (
        <img
          src={d.cover_image}
          alt={d.name}
          className="w-100 rounded-4 mb-5"
          style={{ maxHeight: 480, objectFit: "cover" }}
        />
      )}
      <div className="row">
        <article className="col-lg-8">
          <div className="section-kicker">
            {d.category_name || "Destino turístico"}
          </div>
          <h1 className="display-5 fw-bold my-3">{d.name}</h1>
          {d.excerpt && <p className="lead text-secondary">{d.excerpt}</p>}
          <div className="content-prose mt-4">{d.description}</div>
        </article>
        <aside className="col-lg-4 mt-4 mt-lg-0">
          <div className="p-2 rounded-4" style={{ background: "var(--sand)" }}>
            <h2 className="h5 fw-bold">Información del destino</h2>
            <p>
              <b>Provincia:</b> {d.province_name}
            </p>
            {d.district_name && (
              <p>
                <b>Distrito:</b> {d.district_name}
              </p>
            )}
            {d.address && (
              <p>
                <b>Ubicación:</b> {d.address}
              </p>
            )}
            {d.latitude && d.longitude && (
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps?q=${d.latitude},${d.longitude}`}
              >
                Ver en Google Maps ↗
              </a>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
