"use client";
import { useEffect, useState } from "react";
type Msg = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};
export default function Mensajes() {
  const [items, setItems] = useState<Msg[]>([]);
  const [error, setError] = useState("");
  async function load() {
    try {
      const r = await fetch("/api/admin/mensajes");
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setItems(d);
    } catch (e) {
      setError(String(e));
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function status(id: number, value: string) {
    await fetch("/api/admin/mensajes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: value }),
    });
    await load();
  }
  async function remove(id: number) {
    if (!confirm("¿Eliminar mensaje?")) return;
    await fetch(`/api/admin/mensajes?id=${id}`, { method: "DELETE" });
    await load();
  }
  return (
    <main>
      <h1>Mensajes de contacto</h1>
      <p role="alert">{error}</p>
      {items.map((m) => (
        <article key={m.id} className="card p-3 mb-3">
          <strong>{m.subject}</strong>
          <p>
            {m.name} · {m.email} ·{" "}
            {new Date(m.created_at).toLocaleString("es-PA")}
          </p>
          <p style={{ whiteSpace: "pre-wrap" }}>{m.message}</p>
          <div className="d-flex gap-2">
            <select
              aria-label="Estado"
              className="form-select"
              style={{ maxWidth: 180 }}
              value={m.status}
              onChange={(e) => status(m.id, e.target.value)}
            >
              <option value="NEW">Nuevo</option>
              <option value="READ">Leído</option>
              <option value="RESOLVED">Atendido</option>
            </select>
            <button
              className="btn btn-outline-danger"
              onClick={() => remove(m.id)}
            >
              Eliminar
            </button>
          </div>
        </article>
      ))}
    </main>
  );
}
