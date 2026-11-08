import type { Metadata } from "next";
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");
export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
export type SeoFields = {
  seo_title?: string | null;
  seo_description?: string | null;
  seo_image?: string | null;
  seo_canonical?: string | null;
};
export function seoMetadata(
  data: SeoFields,
  fallback: {
    title: string;
    description: string;
    path: string;
    image?: string | null;
  },
): Metadata {
  const title = data.seo_title?.trim() || fallback.title;
  const description = data.seo_description?.trim() || fallback.description;
  const canonical = data.seo_canonical?.trim() || absoluteUrl(fallback.path);
  const image = data.seo_image?.trim() || fallback.image || undefined;
  const images = image ? [{ url: absoluteUrl(image), alt: title }] : undefined;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "article", images },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((x) => x.url),
    },
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
