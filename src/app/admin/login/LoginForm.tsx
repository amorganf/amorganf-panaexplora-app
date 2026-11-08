"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
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
      const isJson = r.headers.get("content-type")?.includes("application/json");
      const d = isJson ? await r.json() : null;
      if (!r.ok) throw new Error(d?.error || `Error del servidor (${r.status})`);

      // replace: así el botón "Atrás" no vuelve a la pantalla de login
      router.replace("/admin");
      router.refresh();
    } catch (x) {
      setError(x instanceof Error ? x.message : "Error al iniciar sesión");
      setBusy(false);
    }
  }

  return (
    <main
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: "#eef3f4" }}
    >
      <div
        className="card border-0 shadow-sm rounded-4 p-4"
        style={{ width: "100%", maxWidth: 430 }}
      >
        <Link href="/" className="brand-mark text-center fs-4 mb-3">
          Panamá por Descubrir
        </Link>
        <h1 className="h4 fw-bold text-center mb-4">Administración</h1>

        <form onSubmit={submit}>
          <label htmlFor="login-usuario" className="form-label">
            Usuario
          </label>
          <input
            id="login-usuario"
            name="username"
            className="form-control mb-3"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label htmlFor="login-password" className="form-label">
            Contraseña
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            className="form-control mb-3"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-brand w-100" disabled={busy}>
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