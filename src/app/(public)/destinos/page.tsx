import type { Metadata } from "next";
import { query } from "../../lib/db";
import DestinationCard from "../../components/public/DestinationCard";
export const metadata: Metadata = { title: "Destinos turísticos de Panamá" };
export const revalidate = 60;
type D = {
  id: number;
  name: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  province_name: string;
};
export default async function Destinations() {
  const { rows } = await query<D>(
    `SELECT d.id,d.name,d.slug,d.excerpt,d.cover_image,p.name AS province_name FROM destinations d JOIN provinces p ON p.id=d.province_id WHERE d.status='PUBLISHED' ORDER BY d.name`,
  );
  return (
    <main className="container section-space">
      <div className="section-kicker">Explora el país</div>
      <h1 className="display-5 fw-bold mb-3">Destinos turísticos de Panamá</h1>
      <p className="text-secondary mb-5">
        Encuentra lugares para conocer, explorar y disfrutar.
      </p>
      <div className="row g-4">
        {rows.map((d) => (
          <div className="col-md-6 col-lg-4" key={d.id}>
            <DestinationCard
              name={d.name}
              slug={d.slug}
              excerpt={d.excerpt}
              image={d.cover_image}
              province={d.province_name}
            />
          </div>
        ))}
        {!rows.length && <p>Aún no hay destinos publicados.</p>}
      </div>
    </main>
  );
}
