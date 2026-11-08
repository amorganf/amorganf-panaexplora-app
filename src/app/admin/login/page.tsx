"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.push("/admin");
      router.refresh();
    } catch (x) {
      setError(x instanceof Error ? x.message : "Error al iniciar sesión");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: "#eef3f4" }}
    >
      <div
        className="card border-0 shadow-sm rounded-4 p-2"
        style={{ width: "100%", maxWidth: 430 }}
      >
        <Link href="/" className="brand-mark text-center fs-4 mb-3">
          Panamá por Descubrir
        </Link>
        <h1 className="h4 fw-bold text-center">Administración</h1>
        <form onSubmit={submit}>
          <label className="form-label">Usuario</label>
          <input
            className="form-control mb-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label className="form-label">Contraseña</label>
          <input
            className="form-control mb-3"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="alert alert-danger">{error}</div>}
          <button className="btn btn-brand w-100" disabled={busy}>
            {busy ? "Validando..." : "Iniciar sesión"}
          </button>
        </form>
        <Link href="/" className="text-center small mt-3 text-secondary">
          Volver al sitio
        </Link>
      </div>
    </main>
  );
}
