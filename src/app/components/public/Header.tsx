import Link from "next/link";
export default function Header() {
  return (
    <header className="site-header sticky-top">
      <nav className="navbar navbar-expand-lg container py-3">
        <Link className="navbar-brand brand-mark fs-4" href="/">
          PanaExplora
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <Link className="nav-link" href="/">
              Inicio
            </Link>
            <Link className="nav-link" href="/destinos">
              Destinos
            </Link>
            <Link className="nav-link" href="/blog">
              Blog
            </Link>
            <Link className="nav-link" href="/categorias">
              Categorías
            </Link>
            <Link className="nav-link" href="/nosotros">
              Nosotros
            </Link>
            <Link
              className="btn btn-brand rounded-pill px-4 ms-lg-2"
              href="/destinos"
            >
              Explorar Panamá
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
