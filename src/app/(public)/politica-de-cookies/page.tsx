import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de cookies",
  description:
    "Qué cookies utiliza PanaExplora, para qué sirven y cómo aceptarlas, rechazarlas o cambiar tu elección.",
  alternates: { canonical: "/politica-de-cookies" },
};

type CookieInfo = {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
};

function CookieTable({ cookies }: { cookies: CookieInfo[] }) {
  return (
    <div className="table-responsive my-3">
      <table className="table table-bordered align-middle small">
        <thead className="table-light">
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Proveedor</th>
            <th scope="col">Finalidad</th>
            <th scope="col">Duración</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((c) => (
            <tr key={c.name}>
              <td>
                <code>{c.name}</code>
              </td>
              <td>{c.provider}</td>
              <td>{c.purpose}</td>
              <td>{c.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

const necessaryCookies: CookieInfo[] = [
  {
    name: "panaexplora_consent_v1",
    provider: "PanaExplora (almacenamiento local)",
    purpose:
      "Recordar si aceptaste o rechazaste las cookies opcionales, para no preguntarte en cada visita.",
    duration: "12 meses",
  },
  {
    name: "[nombre de la cookie de sesión]",
    provider: "PanaExplora",
    purpose:
      "Mantener iniciada la sesión de los administradores del sitio. No afecta a los visitantes.",
    duration: "[duración de la sesión]",
  },
];

const analyticsCookies: CookieInfo[] = [
  {
    name: "_ga",
    provider: "Google",
    purpose: "Distinguir a los visitantes de forma anónima.",
    duration: "2 años",
  },
  {
    name: "_ga_[ID]",
    provider: "Google",
    purpose: "Mantener el estado de la sesión de analítica.",
    duration: "2 años",
  },
];

const adsCookies: CookieInfo[] = [
  {
    name: "__gads",
    provider: "Google",
    purpose: "Mostrar anuncios y medir su rendimiento.",
    duration: "Hasta 13 meses",
  },
  {
    name: "__gpi",
    provider: "Google",
    purpose: "Mostrar anuncios y medir su rendimiento.",
    duration: "Hasta 13 meses",
  },
  {
    name: "__eoi",
    provider: "Google",
    purpose:
      "Prevenir el fraude publicitario y limitar la repetición de anuncios.",
    duration: "Hasta 6 meses",
  },
];

export default function CookiePolicyPage() {
  return (
    <main className="container section-space" style={{ maxWidth: 850 }}>
      <article style={{ lineHeight: 1.8 }}>
        <h1 className="display-6 fw-bold mb-2">Política de cookies</h1>
        <p className="text-secondary small">
          Última actualización: [día] de [mes] de [año]
        </p>

        <p>
          Esta Política de cookies explica qué son las cookies y tecnologías
          similares, cuáles utiliza PanaExplora (en adelante, “el sitio”), para
          qué sirven y cómo puedes aceptarlas, rechazarlas o cambiar tu elección
          en cualquier momento.
        </p>

        <h2 className="h4 fw-bold mt-5 mb-3">Responsable</h2>
        <p>
          El responsable del sitio es [nombre completo o razón social], con
          domicilio en [ciudad], Panamá. Para cualquier consulta sobre esta
          política puedes escribir a{" "}
          <a href="mailto:[correo de contacto]">[correo de contacto]</a>.
        </p>

        <h2 className="h4 fw-bold mt-5 mb-3">¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos que un sitio web guarda en tu
          navegador cuando lo visitas. Sirven, por ejemplo, para recordar tus
          preferencias o para obtener estadísticas sobre cómo se usa el sitio.
          Además de cookies, algunos sitios usan tecnologías similares, como el
          almacenamiento local del navegador, que funcionan de forma parecida.
          En esta política nos referimos a todas ellas como “cookies”.
        </p>

        <h2 className="h4 fw-bold mt-5 mb-3">
          Tipos de cookies que utilizamos
        </h2>
        <p>
          <strong>Cookies necesarias:</strong> imprescindibles para que el sitio
          funcione y para recordar tu elección sobre cookies. No requieren tu
          consentimiento.
        </p>
        <p>
          <strong>Cookies opcionales:</strong> de analítica y de publicidad.
          Solo las activamos si pulsas “Aceptar opcionales” en el aviso de
          cookies. Si las rechazas, no se carga ningún servicio de analítica ni
          de publicidad.
        </p>

        <h2 className="h4 fw-bold mt-5 mb-3">Cookies necesarias</h2>
        <CookieTable cookies={necessaryCookies} />

        <h2 className="h4 fw-bold mt-5 mb-3">
          Cookies de analítica (opcionales)
        </h2>
        <p>
          Utilizamos Google Analytics, un servicio de Google LLC, para saber de
          forma agregada cuántas personas visitan el sitio, qué páginas leen y
          cómo llegan a ellas. Esta información nos ayuda a mejorar los
          contenidos. Los datos que se recogen incluyen las páginas visitadas,
          el tiempo de permanencia, el tipo de dispositivo y navegador, y una
          ubicación aproximada (país o ciudad). Google indica que Google
          Analytics 4 no almacena direcciones IP.
        </p>
        <CookieTable cookies={analyticsCookies} />

        <h2 className="h4 fw-bold mt-5 mb-3">
          Cookies de publicidad (opcionales)
        </h2>
        <p>
          Utilizamos Google AdSense para mostrar anuncios que nos ayudan a
          mantener el sitio gratuito. Proveedores externos, incluido Google,
          usan cookies para mostrar anuncios basados en las visitas anteriores
          de un usuario a este sitio web o a otros sitios de Internet. Las
          cookies de publicidad permiten a Google y a sus socios mostrar
          anuncios basados en esas visitas.
        </p>
        <CookieTable cookies={adsCookies} />
        <p>
          Puedes desactivar la publicidad personalizada de Google en{" "}
          <ExternalLink href="https://myadcenter.google.com">
            Mi Centro de anuncios
          </ExternalLink>
          . También puedes desactivar la publicidad personalizada de otros
          proveedores en{" "}
          <ExternalLink href="https://www.aboutads.info">
            www.aboutads.info
          </ExternalLink>
          .
        </p>

        <h2 className="h4 fw-bold mt-5 mb-3">
          Transferencia de datos a terceros
        </h2>
        <p>
          Los datos que recogen Google Analytics y Google AdSense son tratados
          por Google, que puede almacenarlos en servidores ubicados fuera de
          Panamá. Puedes consultar cómo los utiliza en su{" "}
          <ExternalLink href="https://policies.google.com/privacy">
            política de privacidad
          </ExternalLink>{" "}
          y en la página{" "}
          <ExternalLink href="https://policies.google.com/technologies/partner-sites">
            Cómo utiliza Google la información de sitios o aplicaciones que
            utilizan sus servicios
          </ExternalLink>
          .
        </p>

        <h2 className="h4 fw-bold mt-5 mb-3">
          Cómo aceptar, rechazar o cambiar tu elección
        </h2>
        <p>
          La primera vez que visitas el sitio te mostramos un aviso para que
          aceptes o rechaces las cookies opcionales. Rechazarlas es tan sencillo
          como aceptarlas, y el sitio funciona igual en ambos casos.
        </p>
        <p>
          Puedes cambiar tu elección en cualquier momento con el enlace
          “Configurar cookies” que encontrarás en el pie de todas las páginas.
          Si retiras tu consentimiento, eliminamos las cookies de Google
          Analytics y Google AdSense de tu navegador y dejamos de cargar esos
          servicios.
        </p>
        <p>
          También puedes bloquear o eliminar las cookies desde la configuración
          de tu navegador. Ten en cuenta que, si borras el almacenamiento del
          sitio, te volveremos a preguntar tu elección en la próxima visita.
        </p>

        <h2 className="h4 fw-bold mt-5 mb-3">Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política si cambian los servicios que
          utilizamos o la normativa aplicable. Indicaremos siempre la fecha de
          la última actualización al inicio de este documento y, si los cambios
          son importantes, volveremos a pedirte tu consentimiento.
        </p>

        <h2 className="h4 fw-bold mt-5 mb-3">Más información</h2>
        <p>
          Para conocer cómo tratamos tus datos personales y cómo ejercer tus
          derechos, consulta nuestra{" "}
          <Link href="/politica-de-privacidad">Política de privacidad</Link>.
        </p>
      </article>
    </main>
  );
}
