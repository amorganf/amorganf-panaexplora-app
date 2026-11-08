"use client";
import { useEffect, useState } from "react";
const fields = [
  { key: "site_name", label: "Nombre del sitio" },
  { key: "site_tagline", label: "Lema" },
  { key: "contact_email", label: "Correo de contacto" },
  { key: "analytics_id", label: "ID Google Analytics 4 (G-...)" },
  { key: "adsense_client", label: "ID AdSense (ca-pub-...)" },
  { key: "privacy_text", label: "Política de Privacidad", long: true },
  { key: "legal_text", label: "Aviso Legal", long: true },
  { key: "cookies_text", label: "Política de Cookies", long: true },
  { key: "about_text", label: "Sobre Nosotros", long: true },
];
export default function Configuracion() {
  const [data, setData] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/configuracion")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setData(d);
      })
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false));
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Guardando...");
    try {
      const r = await fetch("/api/admin/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await r.json();
      setMsg(r.ok ? "Configuración guardada" : d.error || "Error");
    } catch {
      setMsg("No se pudo conectar");
    }
  }
  return (
    <main>
      <h1>Configuración de PanaExplora</h1>
      <p>
        Los servicios de Google se cargan únicamente con consentimiento
        opcional.
      </p>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <form
          onSubmit={save}
          className="d-grid gap-3"
          style={{ maxWidth: 850 }}
        >
          {fields.map((f) => (
            <label key={f.key} className="d-grid gap-1">
              <strong>{f.label}</strong>
              {f.long ? (
                <textarea
                  className="form-control"
                  rows={7}
                  value={data[f.key] || ""}
                  onChange={(e) =>
                    setData({ ...data, [f.key]: e.target.value })
                  }
                />
              ) : (
                <input
                  className="form-control"
                  value={data[f.key] || ""}
                  onChange={(e) =>
                    setData({ ...data, [f.key]: e.target.value })
                  }
                />
              )}
            </label>
          ))}
          {["analytics_enabled", "adsense_enabled"].map((k) => (
            <label key={k} className="d-flex gap-2">
              <input
                type="checkbox"
                checked={data[k] === "true"}
                onChange={(e) =>
                  setData({ ...data, [k]: String(e.target.checked) })
                }
              />
              {k === "analytics_enabled"
                ? "Activar Google Analytics"
                : "Activar Google AdSense"}
            </label>
          ))}
          <button className="btn btn-primary" type="submit">
            Guardar configuración
          </button>
          <p role="status">{msg}</p>
        </form>
      )}
    </main>
  );
}
