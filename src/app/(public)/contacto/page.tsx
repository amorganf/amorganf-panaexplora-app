"use client";
import { useState } from "react";
export default function Contacto() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setStatus("");
    const form = e.currentTarget;
    const b = Object.fromEntries(new FormData(form));
    try {
      const r = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      form.reset();
      setStatus("Mensaje recibido. Gracias por escribirnos.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Error al enviar");
    } finally {
      setSending(false);
    }
  }
  return (
    <main className="container section-space" style={{ maxWidth: 800 }}>
      <h1>Contáctanos</h1>
      <p>Envíanos tus consultas o propuestas para PanaExplora.</p>
      <form onSubmit={submit} className="d-grid gap-3">
        <label>
          Nombre
          <input
            name="name"
            className="form-control"
            required
            minLength={2}
            maxLength={150}
          />
        </label>
        <label>
          Correo electrónico
          <input name="email" type="email" className="form-control" required />
        </label>
        <label>
          Asunto
          <input
            name="subject"
            className="form-control"
            required
            minLength={3}
          />
        </label>
        <label>
          Mensaje
          <textarea
            name="message"
            className="form-control"
            required
            minLength={10}
            rows={6}
          />
        </label>
        <div
          style={{ position: "absolute", left: "-10000px" }}
          aria-hidden="true"
        >
          <label>
            Sitio web
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <button className="btn btn-primary" disabled={sending}>
          {sending ? "Enviando..." : "Enviar mensaje"}
        </button>
        <p role="status">{status}</p>
      </form>
    </main>
  );
}
