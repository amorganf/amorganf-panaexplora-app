import type { Metadata } from "next";

// Todo lo que cuelga de /admin (incluido el login) queda fuera de Google.
export const metadata: Metadata = {
  title: { default: "Administración", template: "%s | Admin PanaExplora" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
