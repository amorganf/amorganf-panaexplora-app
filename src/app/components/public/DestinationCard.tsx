import Link from "next/link";
type Props = {
  name: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  province?: string;
};
export default function DestinationCard({
  name,
  slug,
  excerpt,
  image,
  province,
}: Props) {
  return (
    <article className="card destination-card">
      <Link href={`/destino/${slug}`}>
        <img
          src={
            image ||
            "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900"
          }
          alt={name}
        />
      </Link>
      <div className="card-body">
        {province && (
          <div
            className="small text-uppercase fw-bold mb-2"
            style={{ color: "var(--brand)" }}
          >
            {province}
          </div>
        )}
        <h3 className="h5 fw-bold">
          <Link href={`/destino/${slug}`}>{name}</Link>
        </h3>
        <p className="text-secondary">
          {excerpt || "Conoce este destino y planifica tu próxima aventura."}
        </p>
        <Link
          className="fw-bold"
          style={{ color: "var(--brand)" }}
          href={`/destino/${slug}`}
        >
          Conocer destino →
        </Link>
      </div>
    </article>
  );
}
