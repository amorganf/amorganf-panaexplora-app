import type { Metadata } from "next";
import "../globals.css";
import BootstrapClient from "../components/public/BootstrapClient";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: { default: "PanaExplora", template: "%s | PanaExplora" },
  description:
    "Descubre lugares turísticos de Panamá: playas, montañas, cascadas, cultura y experiencias para viajar.",
  openGraph: { type: "website", locale: "es_PA", siteName: "PanaExplora" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-bs-theme="light">
      <body>
        {children}
        <BootstrapClient />
      </body>
    </html>
  );
}
