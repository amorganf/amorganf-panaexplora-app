import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "Conoce PanaExplora: quiénes somos, qué hacemos y cómo elegimos los lugares que recomendamos para descubrir Panamá.",
  alternates: { canonical: "/sobre-nosotros" },
};

const topics = [
  {
    icon: "bi-water",
    title: "Playas e islas",
    text: "Desde Bocas del Toro hasta Guna Yala y el archipiélago de Las Perlas.",
  },
  {
    icon: "bi-tree",
    title: "Montañas y naturaleza",
    text: "Senderos, cascadas, volcanes y bosques nubosos en las tierras altas.",
  },
  {
    icon: "bi-bank",
    title: "Cultura e historia",
    text: "Pueblos coloniales, tradiciones, festivales y la herencia de sus pueblos originarios.",
  },
  {
    icon: "bi-cup-hot",
    title: "Gastronomía",
    text: "Sabores locales, mercados y lugares donde comer como un panameño.",
  },
];

const values = [
  {
    icon: "bi-check2-circle",
    title: "Información útil y verificada",
    text: "Contrastamos los datos prácticos, como accesos, horarios y precios orientativos, e indicamos la fecha de actualización de cada artículo.",
  },
  {
    icon: "bi-globe-americas",
    title: "Turismo responsable",
    text: "Promovemos viajar respetando la naturaleza, las comunidades y las culturas locales.",
  },
  {
    icon: "bi-shop",
    title: "Apoyo a lo local",
    text: "Damos visibilidad a negocios, guías y emprendimientos panameños que hacen especial cada destino.",
  },
  {
    icon: "bi-shield-check",
    title: "Independencia editorial",
    text: "Nuestras recomendaciones no se compran. Si algún contenido es patrocinado, lo indicamos claramente.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className="bg-light border-bottom">
        <div className="container section-space" style={{ maxWidth: 900 }}>
          <div className="section-kicker">Sobre nosotros</div>
          <h1 className="display-5 fw-bold mt-2 mb-4">
            Te ayudamos a descubrir el Panamá que no aparece en las postales
          </h1>
          <p className="lead text-secondary mb-0">
            PanaExplora es una guía de viajes dedicada a mostrar la diversidad
            de Panamá: sus playas, montañas, cultura y experiencias, con
            información práctica para que planifiques tu próxima aventura.
          </p>
        </div>
      </section>

      <section className="container section-space" style={{ maxWidth: 900 }}>
        <h2 className="h3 fw-bold mb-3">Nuestra historia</h2>
        <div style={{ lineHeight: 1.8 }}>
          <p>
            PanaExplora nació en [año] de una idea sencilla: [cuenta aquí cómo
            surgió el proyecto, por ejemplo, la dificultad de encontrar
            información clara y actualizada sobre destinos fuera de las rutas
            más conocidas].
          </p>
          <p>
            Detrás del sitio está [nombre o “un pequeño equipo de panameños”],
            [breve descripción: apasionados por viajar, fotografía, naturaleza,
            etc.]. Recorremos el país, hablamos con la gente de cada lugar y
            compartimos lo que aprendemos para que tu viaje sea más fácil.
          </p>
        </div>
      </section>

      <section className="bg-light">
        <div className="container section-space">
          <h2 className="h3 fw-bold mb-4 text-center">Qué encontrarás aquí</h2>
          <div className="row g-4">
            {topics.map((t) => (
              <div key={t.title} className="col-sm-6 col-lg-3">
                <div className="bg-body border rounded-4 p-2 h-100">
                  <i
                    className={`bi ${t.icon} fs-2 d-block mb-3`}
                    style={{ color: "var(--brand)" }}
                    aria-hidden="true"
                  />
                  <h3 className="h5 fw-bold">{t.title}</h3>
                  <p className="text-secondary mb-0">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container section-space">
        <h2 className="h3 fw-bold mb-4 text-center">Lo que nos guía</h2>
        <div className="row g-4">
          {values.map((v) => (
            <div key={v.title} className="col-md-6">
              <div className="d-flex gap-3">
                <i
                  className={`bi ${v.icon} fs-3 flex-shrink-0`}
                  style={{ color: "var(--brand)" }}
                  aria-hidden="true"
                />
                <div>
                  <h3 className="h5 fw-bold">{v.title}</h3>
                  <p className="text-secondary mb-0">{v.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-light">
        <div className="container section-space" style={{ maxWidth: 900 }}>
          <h2 className="h3 fw-bold mb-3">Cómo elegimos los lugares</h2>
          <div style={{ lineHeight: 1.8 }}>
            <p>
              Priorizamos destinos que hemos visitado o sobre los que tenemos
              información confiable de fuentes locales y oficiales. Antes de
              publicar, revisamos los datos prácticos y, cuando algo cambia,
              actualizamos el artículo.
            </p>
            <p>
              Aun así, los horarios, precios y accesos pueden variar. Te
              recomendamos confirmarlos antes de viajar. Si encuentras un dato
              desactualizado, nos ayudas mucho avisándonos.
            </p>
            <p className="mb-0">
              El sitio se mantiene en parte gracias a la publicidad. Los
              anuncios no influyen en lo que recomendamos.
            </p>
          </div>
        </div>
      </section>

      <section
        className="container section-space text-center"
        style={{ maxWidth: 700 }}
      >
        <h2 className="h3 fw-bold mb-3">¿Hablamos?</h2>
        <p className="text-secondary mb-4">
          ¿Tienes una sugerencia, encontraste un error o quieres colaborar con
          nosotros? Escríbenos a{" "}
          <a href="mailto:[correo de contacto]">[correo de contacto]</a>.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <Link href="/blog" className="btn btn-brand btn-lg rounded-pill px-4">
            Explorar artículos
          </Link>
          <a
            href="mailto:[correo de contacto]"
            className="btn btn-outline-secondary btn-lg rounded-pill px-4"
          >
            Contactar
          </a>
        </div>
      </section>
    </main>
  );
}
