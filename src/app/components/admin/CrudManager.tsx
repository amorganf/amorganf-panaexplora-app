"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
type Row = Record<string, unknown> & { id: number | string };
type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "select"
    | "checkbox"
    | "number"
    | "email"
    | "password";
  options?: { value: string; label: string }[];
  required?: boolean;
};
export default function CrudManager({
  resource,
  title,
  fields,
  columns,
  canCreate = true,
}: {
  resource: string;
  title: string;
  fields: Field[];
  columns: { key: string; label: string }[];
  canCreate?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>([]),
    [editing, setEditing] = useState<Row | null>(null),
    [open, setOpen] = useState(false),
    [form, setForm] = useState<Record<string, unknown>>({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [search, setSearch] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/${resource}`, { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo cargar");
      setRows(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [resource]);
  useEffect(() => {
    void load();
  }, [load]);
  const visible = useMemo(
    () =>
      rows.filter((r) =>
        columns.some((c) =>
          String(r[c.key] ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
      ),
    [rows, columns, search],
  );
  function start(row?: Row) {
    setEditing(row || null);
    const values: Record<string, unknown> = {};
    for (const f of fields)
      values[f.name] =
        f.type === "password"
          ? ""
          : (row?.[f.name] ?? (f.type === "checkbox" ? false : ""));
    setForm(values);
    setError("");
    setOpen(true);
  }
  function change(name: string, value: unknown) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = { ...form, ...(editing ? { id: editing.id } : {}) };
      const r = await fetch(`/api/admin/${resource}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo guardar");
      setOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setBusy(false);
    }
  }
  async function remove(row: Row) {
    if (!window.confirm(`¿Eliminar ${String(row[columns[0]?.key] ?? row.id)}?`))
      return;
    setError("");
    try {
      const r = await fetch(
        `/api/admin/${resource}?id=${encodeURIComponent(String(row.id))}`,
        { method: "DELETE" },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo eliminar");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  }
  async function upload(file: File, field: string) {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo subir la imagen");
      change(field, d.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 className="h2 fw-bold mb-0">{title}</h1>
        {canCreate && (
          <button
            type="button"
            className="btn btn-brand"
            onClick={() => start()}
          >
            + Nuevo registro
          </button>
        )}
      </div>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      <div className="mb-3">
        <input
          className="form-control"
          aria-label="Buscar registros"
          placeholder="Buscar registros..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {open && (
        <form className="bg-white rounded-4 shadow-sm p-2 mb-4" onSubmit={save}>
          <h2 className="h5 fw-bold mb-3">
            {editing ? "Editar" : "Nuevo"} registro
          </h2>
          <div className="row g-3">
            {fields.map((f) => (
              <div
                className={f.type === "textarea" ? "col-12" : "col-md-6"}
                key={f.name}
              >
                {f.type === "checkbox" ? (
                  <div className="form-check mt-4">
                    <input
                      id={`field-${f.name}`}
                      className="form-check-input"
                      type="checkbox"
                      checked={Boolean(form[f.name])}
                      onChange={(e) => change(f.name, e.target.checked)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`field-${f.name}`}
                    >
                      {f.label}
                    </label>
                  </div>
                ) : (
                  <>
                    <label className="form-label" htmlFor={`field-${f.name}`}>
                      {f.label}
                    </label>
                    {f.type === "textarea" ? (
                      <textarea
                        id={`field-${f.name}`}
                        className="form-control"
                        rows={6}
                        required={f.required}
                        value={String(form[f.name] ?? "")}
                        onChange={(e) => change(f.name, e.target.value)}
                      />
                    ) : f.type === "select" ? (
                      <select
                        id={`field-${f.name}`}
                        className="form-select"
                        value={String(form[f.name] ?? "")}
                        required={f.required}
                        onChange={(e) => change(f.name, e.target.value)}
                      >
                        <option value="">Seleccionar</option>
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={`field-${f.name}`}
                        className="form-control"
                        type={f.type || "text"}
                        step={f.type === "number" ? "any" : undefined}
                        required={
                          f.required && !(editing && f.type === "password")
                        }
                        value={String(form[f.name] ?? "")}
                        onChange={(e) =>
                          change(
                            f.name,
                            f.type === "number"
                              ? e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                              : e.target.value,
                          )
                        }
                      />
                    )}
                    {(f.name === "cover_image" || f.name === "image_url") && (
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="form-control mt-2"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          void upload(e.target.files[0], f.name)
                        }
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="d-flex gap-2 mt-4">
            <button className="btn btn-brand" disabled={busy}>
              {busy ? "Procesando..." : "Guardar"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setOpen(false);
                setError("");
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      <div className="table-responsive bg-white rounded-4 shadow-sm p-3">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={String(row.id)}>
                {columns.map((c) => (
                  <td key={c.key}>
                    {typeof row[c.key] === "boolean"
                      ? row[c.key]
                        ? "Sí"
                        : "No"
                      : String(row[c.key] ?? "—")}
                  </td>
                ))}
                <td className="text-nowrap">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => start(row)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => void remove(row)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={columns.length + 1} className="text-secondary">
                  {loading ? "Cargando..." : "No hay registros."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
