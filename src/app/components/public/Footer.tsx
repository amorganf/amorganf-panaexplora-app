"use client";
import Link from "next/link";
export default function Footer() {
  return (
    <footer className="site-footer mt-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <h4 className="text-white fw-bold">PanaExplora</h4>
            <p>Descubre Panamá, un destino a la vez.</p>
          </div>
          <div className="col-md-3">
            <h6 className="text-white">Explora</h6>
            <p>
              <Link href="/destinos">Destinos</Link>
            </p>
            <p>
              <Link href="/blog">Blog</Link>
            </p>
            <p>
              <Link href="/sobre-nosotros">Sobre Nosotros</Link>
            </p>
          </div>
          <div className="col-md-4">
            <h6 className="text-white">Información</h6>
            <p>
              <Link href="/politica-de-privacidad">Política de Privacidad</Link>
            </p>
            <p>
              <Link href="/aviso-legal">Aviso Legal</Link>
            </p>
            <p>
              <Link href="/politica-de-cookies">Política de Cookies</Link>
            </p>
            <p>
              <Link href="/contacto">Contáctanos</Link>
            </p>
            <button
              className="btn btn-link p-0"
              onClick={() =>
                window.dispatchEvent(new Event("panaexplora-cookie-settings"))
              }
            >
              Cambiar preferencias de cookies
            </button>
          </div>
        </div>
        <hr className="border-secondary my-4" />
        <small>© {new Date().getFullYear()} PanaExplora.</small>
      </div>
    </footer>
  );
}
