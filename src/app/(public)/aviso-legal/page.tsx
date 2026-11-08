import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aviso legal",
  description:
    "Información sobre el responsable de PanaExplora y las condiciones de uso del sitio.",
  alternates: { canonical: "/aviso-legal" },
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

export default function LegalNoticePage() {
  return (
    <main className="container section-space" style={{ maxWidth: 850 }}>
      <article style={{ lineHeight: 1.8 }}>
        <h1 className="display-6 fw-bold mb-2">Aviso legal</h1>
        <p className="text-secondary small">
          Última actualización: [día] de [mes] de [año]
        </p>

        <p>
          Este Aviso legal regula el acceso y uso del sitio web PanaExplora (en
          adelante, “el sitio”), disponible en [dominio del sitio]. Al navegar
          por el sitio aceptas estas condiciones. Si no estás de acuerdo con
          ellas, te pedimos que no lo utilices.
        </p>

        <Section title="Responsable del sitio">
          <p>
            El sitio es propiedad de [nombre completo o razón social], [cédula o
            RUC], con domicilio en [dirección], [ciudad], Panamá.
          </p>
          <p>
            Puedes contactarnos escribiendo a{" "}
            <a href="mailto:[correo de contacto]">[correo de contacto]</a>.
          </p>
        </Section>

        <Section title="Objeto del sitio">
          <p>
            PanaExplora es un sitio informativo dedicado a difundir lugares
            turísticos, experiencias, cultura y recomendaciones de viaje en
            Panamá. Los contenidos tienen una finalidad orientativa y de
            divulgación, y su acceso es gratuito.
          </p>
        </Section>

        <Section title="Condiciones de uso">
          <p>
            Te comprometes a utilizar el sitio de forma lícita y respetuosa, sin
            realizar acciones que puedan dañarlo, sobrecargarlo o impedir su
            normal funcionamiento. En particular, no está permitido intentar
            acceder a zonas restringidas, como el panel de administración, sin
            autorización, ni utilizar sistemas automatizados para copiar
            masivamente sus contenidos.
          </p>
        </Section>

        <Section title="Exactitud de la información turística">
          <p>
            Hacemos lo posible para que la información publicada sea correcta y
            esté actualizada. Sin embargo, datos como horarios, precios,
            accesos, rutas, condiciones climáticas o requisitos de entrada
            pueden cambiar sin previo aviso.
          </p>
          <p>
            Te recomendamos confirmar siempre la información directamente con
            los establecimientos, operadores turísticos o autoridades
            correspondientes antes de viajar. Las actividades al aire libre,
            como senderismo, buceo o visitas a zonas naturales, implican riesgos
            propios: infórmate sobre las condiciones y medidas de seguridad, y
            actúa con prudencia.
          </p>
        </Section>

        <Section title="Propiedad intelectual">
          <p>
            Los textos, el diseño, el logotipo y los demás elementos propios del
            sitio pertenecen a [nombre del titular] o se utilizan con
            autorización. No está permitida su reproducción, distribución o
            modificación con fines comerciales sin permiso previo por escrito.
          </p>
          <p>
            Puedes compartir enlaces a nuestros artículos y citar fragmentos
            breves, siempre que indiques la fuente y enlaces al contenido
            original.
          </p>
          <p>
            Algunas fotografías pertenecen a sus respectivos autores y se
            utilizan bajo las licencias que lo permiten, como la de Unsplash. Si
            consideras que algún contenido vulnera tus derechos, escríbenos y lo
            revisaremos a la mayor brevedad.
          </p>
        </Section>

        <Section title="Enlaces a otros sitios">
          <p>
            El sitio puede incluir enlaces a páginas de terceros, como
            establecimientos, operadores turísticos o fuentes oficiales. No
            controlamos esos sitios ni somos responsables de su contenido,
            disponibilidad o políticas de privacidad. Incluir un enlace no
            implica que recomendemos o respaldemos sus servicios.
          </p>
        </Section>

        <Section title="Publicidad">
          <p>
            El sitio puede mostrar anuncios gestionados por terceros, como
            Google AdSense. Los productos y servicios anunciados son
            responsabilidad de sus anunciantes. Puedes consultar cómo se usan
            las cookies publicitarias en nuestra{" "}
            <Link href="/politica-de-cookies">Política de cookies</Link>.
          </p>
        </Section>

        <Section title="Limitación de responsabilidad">
          <p>
            No garantizamos que el sitio esté disponible de forma ininterrumpida
            ni libre de errores. En la medida permitida por la ley, no nos
            hacemos responsables de los daños o perjuicios derivados del uso de
            la información publicada, de decisiones de viaje tomadas a partir de
            ella, ni de fallos técnicos ajenos a nuestro control.
          </p>
        </Section>

        <Section title="Protección de datos y cookies">
          <p>
            La forma en que tratamos tus datos personales se describe en nuestra{" "}
            <Link href="/politica-de-privacidad">Política de privacidad</Link>,
            y el uso de cookies en nuestra{" "}
            <Link href="/politica-de-cookies">Política de cookies</Link>.
          </p>
        </Section>

        <Section title="Modificaciones">
          <p>
            Podemos modificar este Aviso legal para adaptarlo a cambios en el
            sitio o en la normativa. La versión vigente será siempre la
            publicada en esta página, con su fecha de última actualización.
          </p>
        </Section>

        <Section title="Legislación aplicable">
          <p>
            Este Aviso legal se rige por las leyes de la República de Panamá.
            Cualquier controversia relacionada con el sitio se someterá a los
            tribunales competentes de [ciudad], Panamá, salvo que la ley
            disponga otra cosa.
          </p>
        </Section>
      </article>
    </main>
  );
}
