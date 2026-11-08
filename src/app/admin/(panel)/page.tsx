import type { Metadata } from "next";
import Link from "next/link";
import { query } from "../../lib/db";
import { requireAdminOrRedirect, type Role } from "../../lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

type Stats = {
  destinations: string;
  articles_published: string;
  articles_draft: string;
  categories: string;
  provinces: string;
  users: string;
};

type Card = {
  label: string;
  value: keyof Stats;
  href: string;
  detail?: (s: Stats) => string;
  roles?: Role[];
};

// Mismos permisos que el menú lateral.
const CARDS: Card[] = [
  { label: "Destinos", value: "destinations", href: "/admin/destinos" },
  {
    label: "Artículos publicados",
    value: "articles_published",
    href: "/admin/articulos",
    detail: (s) =>
      `${s.articles_draft} ${s.articles_draft === "1" ? "borrador" : "borradores"}`,
  },
  {
    label: "Categorías",
    value: "categories",
    href: "/admin/categorias",
    roles: ["SUPERADMIN", "ADMIN"],
  },
  {
    label: "Provincias",
    value: "provinces",
    href: "/admin/provincias",
    roles: ["SUPERADMIN", "ADMIN"],
  },
  {
    label: "Usuarios",
    value: "users",
    href: "/admin/usuarios",
    roles: ["SUPERADMIN"],
  },
];

export default async function DashboardPage() {
  const user = await requireAdminOrRedirect();

  const { rows } = await query<Stats>(
    `SELECT
       (SELECT COUNT(*) FROM destinations)::text AS destinations,
       (SELECT COUNT(*) FROM articles WHERE status = 'PUBLISHED')::text AS articles_published,
       (SELECT COUNT(*) FROM articles WHERE status <> 'PUBLISHED')::text AS articles_draft,
       (SELECT COUNT(*) FROM categories)::text AS categories,
       (SELECT COUNT(*) FROM provinces)::text AS provinces,
       (SELECT COUNT(*) FROM users)::text AS users`,
  );
  const stats = rows[0];

  const cards = CARDS.filter((c) => !c.roles || c.roles.includes(user.role));

  return (
    <>
      <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
        <div>
          <div className="section-kicker">Panel de control</div>
          <h1 className="h2 fw-bold mb-0">Hola, {user.name}</h1>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener"
          className="btn btn-outline-secondary"
        >
          Ver sitio <span aria-hidden="true">↗</span>
          <span className="visually-hidden">
            {" "}
            (se abre en una pestaña nueva)
          </span>
        </Link>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
        {cards.map((card) => (
          <div className="col" key={card.href}>
            <Link
              href={card.href}
              className="card border-0 shadow-sm rounded-4 p-3 h-100 text-decoration-none text-body"
            >
              <div className="text-secondary">{card.label}</div>
              <div className="display-5 fw-bold">{stats[card.value]}</div>
              {card.detail && (
                <div className="small text-secondary">{card.detail(stats)}</div>
              )}
              <small className="mt-2" style={{ color: "var(--brand)" }}>
                Administrar <span aria-hidden="true">→</span>
              </small>
            </Link>
          </div>
        ))}
      </div>

      <div className="alert alert-info mt-4 mb-0">
        Publica contenido original y utiliza imágenes propias o con licencia de
        uso.
      </div>
    </>
  );
}
