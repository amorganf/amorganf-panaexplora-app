import Header from "../components/public/Header";
import Footer from "../components/public/Footer";
import CookieConsent from "../components/CookieConsent";
import { getTrackingConfig } from "../lib/data/settings";

// Los ajustes se leen de la base de datos como máximo cada 5 minutos.
// Al guardarlos desde el admin, llama a revalidatePath("/", "layout")
// para que el cambio se aplique al instante.
export const revalidate = 300;

// Layout de la parte pública: cabecera, pie y banner de cookies.
export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const { analyticsId, adsenseClient } = await getTrackingConfig();

  return (
    <>
      <Header />
      {children}
      <Footer />
      <CookieConsent analyticsId={analyticsId} adsenseClient={adsenseClient} />
    </>
  );
}
