"use client";
import { useEffect, useState } from "react";
type Section = {
  section_key: string;
  title: string;
  enabled: boolean;
  sort_order: number;
};
export default function SectionsAdmin() {
  const [items, setItems] = useState<Section[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState("");
  useEffect(() => {
    fetch("/api/admin/home-sections", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setItems(d);
      })
      .catch((e) => setError(String(e)));
  }, []);
  function change(k: string, patch: Partial<Section>) {
    setItems((v) =>
      v.map((x) => (x.section_key === k ? { ...x, ...patch } : x)),
    );
  }
  async function save(x: Section) {
    setBusy(x.section_key);
    setError("");
    try {
      const r = await fetch("/api/admin/home-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(x),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      change(x.section_key, d);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <main>
      <h1 className="h2 fw-bold">Secciones de la página principal</h1>
      <p className="text-secondary">
        Activa, desactiva, cambia el título y ordena cada sección. La sección de
        artículos contiene la búsqueda, filtros y paginación.
      </p>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        {items.map((x) => (
          <div className="col-12" key={x.section_key}>
            <div className="bg-white p-2 rounded-4 shadow-sm">
              <div className="row g-3 align-items-end">
                <div className="col-md-5">
                  <label className="form-label">Título</label>
                  <input
                    className="form-control"
                    value={x.title}
                    onChange={(e) =>
                      change(x.section_key, { title: e.target.value })
                    }
                  />
                  <small className="text-secondary">{x.section_key}</small>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Orden</label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    className="form-control"
                    value={x.sort_order}
                    onChange={(e) =>
                      change(x.section_key, {
                        sort_order: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={x.enabled}
                      onChange={(e) =>
                        change(x.section_key, { enabled: e.target.checked })
                      }
                    />
                    <span className="form-check-label">Sección activa</span>
                  </label>
                </div>
                <div className="col-md-2">
                  <button
                    className="btn btn-brand w-100"
                    disabled={!!busy}
                    onClick={() => save(x)}
                  >
                    {busy === x.section_key ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
