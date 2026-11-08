import { requireAdminOrRedirect, type Role } from "../../lib/auth";
import { logoutAction } from "@/app/admin/logout-action";
import AdminNav, { type NavItem } from "./AdminNav";

// roles: quién ve cada enlace. Sin roles = todos los usuarios del admin.
// Ocultar un enlace no protege la página: cada página debe comprobar
// también el rol con requireAdminOrRedirect.
const NAV: (NavItem & { roles?: Role[] })[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/secciones", label: "Secciones del inicio", roles: ["SUPERADMIN", "ADMIN"] },
  { href: "/admin/destinos", label: "Destinos" },
  { href: "/admin/articulos", label: "Artículos" },
  { href: "/admin/categorias", label: "Categorías", roles: ["SUPERADMIN", "ADMIN"] },
  { href: "/admin/provincias", label: "Provincias", roles: ["SUPERADMIN", "ADMIN"] },
  { href: "/admin/distritos", label: "Distritos", roles: ["SUPERADMIN", "ADMIN"] },
  { href: "/admin/galeria", label: "Galería" },
  { href: "/admin/mensajes", label: "Mensajes", roles: ["SUPERADMIN", "ADMIN"] },
  { href: "/admin/anuncios", label: "Anuncios", roles: ["SUPERADMIN", "ADMIN"] },
  { href: "/admin/usuarios", label: "Usuarios", roles: ["SUPERADMIN"] },
  { href: "/admin/configuracion", label: "Configuración", roles: ["SUPERADMIN"] },
];

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminOrRedirect();

  const items = NAV.filter((i) => !i.roles || i.roles.includes(user.role)).map(
    ({ href, label }) => ({ href, label }),
  );

  return (
    <div className="admin-shell">
      <div className="container-fluid">
        <div className="row min-vh-100">
          <aside className="col-md-3 col-xl-2 admin-sidebar p-3">
            <div className="d-flex align-items-center justify-content-between mb-md-4">
              <div className="fw-bold fs-5 text-white">PanaExplora Admin</div>
              <button
                type="button"
                className="btn btn-outline-light btn-sm d-md-none"
                data-bs-toggle="collapse"
                data-bs-target="#admin-menu"
                aria-controls="admin-menu"
                aria-expanded="false"
                aria-label="Mostrar menú"
              >
                <i className="bi bi-list" aria-hidden="true" />
              </button>
            </div>

            <div id="admin-menu" className="collapse d-md-block mt-3 mt-md-0">
              <div className="small text-white-50 mb-3">
                {user.name} · {user.role}
              </div>
              <AdminNav items={items} />
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="btn btn-outline-light btn-sm w-100 mt-4"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </aside>

          <main className="col-md-9 col-xl-10 p-3 p-lg-5">{children}</main>
        </div>
      </div>
    </div>
  );
}