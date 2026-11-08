import type { Metadata } from "next";
import ArticleListing from "../../components/public/ArticleListing";
export const metadata: Metadata = {
  title: "Blog y guías de viaje",
  alternates: { canonical: "/blog" },
};
export const dynamic = "force-dynamic";
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export default function Blog({ searchParams }: Props) {
  return (
    <main>
      <ArticleListing
        searchParams={searchParams}
        path="/blog"
        heading="Blog y guías de viaje"
        intro="Todos nuestros artículos publicados, con búsqueda, categorías y ubicación."
      />
    </main>
  );
}
