import "server-only";
import { cache } from "react";
import { query } from "../db";

export const settingKeys = [
  "site_name",
  "site_tagline",
  "contact_email",
  "analytics_enabled",
  "analytics_id",
  "adsense_enabled",
  "adsense_client",
  "privacy_text",
  "legal_text",
  "cookies_text",
  "about_text",
] as const;

export type Settings = Record<(typeof settingKeys)[number], string>;
const defaults: Settings = {
  site_name: "PanaExplora",
  site_tagline: "Descubre Panamá, un destino a la vez.",
  contact_email: "",
  analytics_enabled: "false",
  analytics_id: "",
  adsense_enabled: "false",
  adsense_client: "",
  privacy_text: "",
  legal_text: "",
  cookies_text: "",
  about_text: "",
};

export type SiteSettings = Record<string, string>;

// Lee todos los ajustes una sola vez por petición.
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const { rows } = await query<{ key: string; value: string | null }>(
    "SELECT key, value FROM site_settings",
  );
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
});

// Los IDs se validan porque terminan dentro de un <script>:
// un valor mal escrito en el admin no debe romper ni inyectar nada.
export async function getTrackingConfig() {
  const s = await getSettings();

  const analyticsId =
    s.analytics_enabled === "true" && /^G-[A-Z0-9]+$/.test(s.analytics_id ?? "")
      ? s.analytics_id
      : "";

  const adsenseClient =
    s.adsense_enabled === "true" && /^ca-pub-\d+$/.test(s.adsense_client ?? "")
      ? s.adsense_client
      : "";

  return { analyticsId, adsenseClient };
}
