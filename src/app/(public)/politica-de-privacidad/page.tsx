import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo PanaExplora recoge, utiliza y protege tus datos personales, y cómo ejercer tus derechos.",
  alternates: { canonical: "/politica-de-privacidad" },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="h4 fw-bold mt-5 mb-3">{title}</h2>
      {children}
    </section>
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

export default function PrivacyPolicyPage() {
  return (
    <main className="container section-space" style={{ maxWidth: 850 }}>
      <article style={{ lineHeight: 1.8 }}>
        <h1 className="display-6 fw-bold mb-2">Política de privacidad</h1>
        <p className="text-secondary small">
          Última actualización: [día] de [mes] de [año]
        </p>

        <p>
          En PanaExplora (en adelante, “el sitio”) respetamos tu privacidad.
          Esta política explica qué datos personales recogemos, para qué los
          usamos, con quién los compartimos y cómo puedes ejercer tus derechos,
          de acuerdo con la Ley 81 de 2019 sobre Protección de Datos Personales
          de la República de Panamá y su reglamentación.
        </p>

        <Section title="Responsable del tratamiento">
          <p>
            El responsable de tus datos es [nombre completo o razón social],
            [cédula o RUC], con domicilio en [dirección], [ciudad], Panamá.
          </p>
          <p>
            Para cualquier consulta sobre privacidad puedes escribir a{" "}
            <a href="mailto:[correo de privacidad]">[correo de privacidad]</a>.
          </p>
        </Section>

        <Section title="Qué datos recogemos">
          <p>
            Puedes leer el sitio sin registrarte ni darnos ningún dato personal.
            Solo recogemos datos en estos casos:
          </p>
          <ul>
            <li>
              <strong>Datos de navegación</strong>, si aceptas las cookies de
              analítica: páginas visitadas, tiempo de permanencia, tipo de
              dispositivo y navegador, y ubicación aproximada (país o ciudad),
              recogidos mediante Google Analytics.
            </li>
            <li>
              <strong>Datos publicitarios</strong>, si aceptas las cookies de
              publicidad: identificadores de cookies e información sobre tu
              interacción con los anuncios, recogidos mediante Google AdSense.
            </li>
            <li>
              <strong>Datos de contacto</strong>, si nos escribes por correo
              electrónico: tu nombre, tu dirección de correo y el contenido de
              tu mensaje.
            </li>
            <li>
              <strong>Datos de los administradores</strong> del sitio: nombre,
              correo electrónico y contraseña, que se guarda cifrada y nunca en
              texto legible.
            </li>
          </ul>
          <p>
            Además, como cualquier servidor web, nuestro proveedor de
            alojamiento puede registrar de forma temporal datos técnicos como la
            dirección IP y la fecha de acceso, con fines de seguridad y
            funcionamiento.
          </p>
        </Section>

        <Section title="Para qué usamos tus datos y con qué base">
          <ul>
            <li>
              <strong>
                Analizar el uso del sitio y mejorar los contenidos
              </strong>
              , con base en tu consentimiento, que das al aceptar las cookies de
              analítica.
            </li>
            <li>
              <strong>Mostrar publicidad</strong> que nos ayuda a mantener el
              sitio gratuito, con base en tu consentimiento, que das al aceptar
              las cookies de publicidad.
            </li>
            <li>
              <strong>Responder a tus mensajes</strong>, con base en tu
              solicitud al escribirnos.
            </li>
            <li>
              <strong>Gestionar y proteger el sitio</strong>, incluidas las
              cuentas de administración y la prevención de accesos no
              autorizados, con base en nuestro interés legítimo en mantener el
              sitio seguro.
            </li>
          </ul>
          <p>
            No vendemos tus datos personales ni los usamos para tomar decisiones
            automatizadas que te afecten de forma significativa.
          </p>
        </Section>

        <Section title="Publicidad de Google">
          <p>
            Proveedores externos, incluido Google, usan cookies para mostrar
            anuncios basados en las visitas anteriores de un usuario a este
            sitio web o a otros sitios de Internet. Las cookies de publicidad
            permiten a Google y a sus socios mostrar anuncios basados en esas
            visitas.
          </p>
          <p>
            Puedes desactivar la publicidad personalizada de Google en{" "}
            <ExternalLink href="https://myadcenter.google.com">
              Mi Centro de anuncios
            </ExternalLink>
            , y la de otros proveedores en{" "}
            <ExternalLink href="https://www.aboutads.info">
              www.aboutads.info
            </ExternalLink>
            . Encontrarás el detalle de cada cookie en nuestra{" "}
            <Link href="/politica-de-cookies">Política de cookies</Link>.
          </p>
        </Section>

        <Section title="Con quién compartimos tus datos">
          <p>
            Solo compartimos datos con proveedores que necesitamos para operar
            el sitio, y únicamente en la medida necesaria:
          </p>
          <ul>
            <li>
              <strong>Google LLC</strong>, para los servicios de Google
              Analytics y Google AdSense, solo si aceptas las cookies
              correspondientes.
            </li>
            <li>
              <strong>[Proveedor de alojamiento]</strong>, que aloja el sitio.
            </li>
            <li>
              <strong>[Proveedor de base de datos]</strong>, que almacena el
              contenido del sitio y las cuentas de administración.
            </li>
          </ul>
          <p>
            También podremos comunicar datos a las autoridades cuando exista una
            obligación legal de hacerlo.
          </p>
        </Section>

        <Section title="Transferencias internacionales">
          <p>
            Algunos de estos proveedores, como Google, pueden almacenar o tratar
            datos en servidores ubicados fuera de Panamá. En esos casos,
            trabajamos con proveedores que ofrecen garantías adecuadas de
            protección. Puedes consultar cómo trata Google los datos en su{" "}
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
        </Section>

        <Section title="Cuánto tiempo conservamos tus datos">
          <ul>
            <li>
              <strong>Datos de analítica:</strong> [14 meses], según la
              configuración de conservación de Google Analytics.
            </li>
            <li>
              <strong>Mensajes de contacto:</strong> el tiempo necesario para
              responderte y, como máximo, [plazo] después.
            </li>
            <li>
              <strong>Cuentas de administración:</strong> mientras la persona
              mantenga esa función en el sitio.
            </li>
          </ul>
          <p>
            Las cookies tienen sus propias duraciones, que se detallan en la{" "}
            <Link href="/politica-de-cookies">Política de cookies</Link>.
          </p>
        </Section>

        <Section title="Tus derechos">
          <p>
            De acuerdo con la legislación panameña, puedes ejercer en cualquier
            momento los siguientes derechos sobre tus datos personales:
          </p>
          <ul>
            <li>
              <strong>Acceso:</strong> saber qué datos tuyos tratamos.
            </li>
            <li>
              <strong>Rectificación:</strong> corregir datos inexactos o
              incompletos.
            </li>
            <li>
              <strong>Cancelación:</strong> solicitar que eliminemos tus datos.
            </li>
            <li>
              <strong>Oposición:</strong> oponerte a que tratemos tus datos para
              determinados fines.
            </li>
            <li>
              <strong>Portabilidad:</strong> recibir tus datos en un formato
              estructurado y de uso común.
            </li>
          </ul>
          <p>
            Para ejercerlos, escríbenos a{" "}
            <a href="mailto:[correo de privacidad]">[correo de privacidad]</a>{" "}
            indicando qué derecho deseas ejercer. Es posible que te pidamos
            información para verificar tu identidad. Responderemos dentro de los
            plazos establecidos por la ley.
          </p>
          <p>
            También puedes retirar tu consentimiento a las cookies opcionales en
            cualquier momento con el enlace “Configurar cookies” del pie de
            página.
          </p>
          <p>
            Si consideras que no hemos atendido correctamente tu solicitud,
            puedes presentar una reclamación ante la Autoridad Nacional de
            Transparencia y Acceso a la Información (ANTAI), autoridad
            competente en materia de protección de datos personales en Panamá.
          </p>
        </Section>

        <Section title="Seguridad">
          <p>
            Aplicamos medidas técnicas y organizativas para proteger tus datos,
            como conexiones cifradas (HTTPS), contraseñas almacenadas de forma
            cifrada y acceso restringido al panel de administración. Ningún
            sistema es completamente infalible, pero revisamos estas medidas
            periódicamente.
          </p>
        </Section>

        <Section title="Menores de edad">
          <p>
            El sitio no está dirigido a menores de edad y no recogemos
            conscientemente datos personales de menores. Si eres padre, madre o
            tutor y crees que un menor nos ha facilitado datos, escríbenos y los
            eliminaremos.
          </p>
        </Section>

        <Section title="Cambios en esta política">
          <p>
            Podemos actualizar esta política si cambian los servicios que
            utilizamos o la normativa aplicable. La versión vigente será siempre
            la publicada en esta página, con su fecha de última actualización.
            Si los cambios son importantes, te lo indicaremos de forma visible
            en el sitio.
          </p>
        </Section>

        <Section title="Más información">
          <p>
            Consulta también nuestro{" "}
            <Link href="/aviso-legal">Aviso legal</Link> y nuestra{" "}
            <Link href="/politica-de-cookies">Política de cookies</Link>.
          </p>
        </Section>
      </article>
    </main>
  );
}
