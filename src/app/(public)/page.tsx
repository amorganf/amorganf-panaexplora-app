/*
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
es lo mismo que esto PageProps<"/">
*/

import type { Metadata } from "next";
import HomeSections from "../components/public/HomeSections";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home({ searchParams }: PageProps<"/">) {
  return <HomeSections searchParams={searchParams} />;
}
