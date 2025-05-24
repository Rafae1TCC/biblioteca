import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Política de Privacidad | BibliotecaHub",
  description: "Política de privacidad y protección de datos de BibliotecaHub",
}

export default function PrivacidadPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="contenido-principal" className="flex-1 container py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-muted-foreground mb-6">Última actualización: 1 de mayo de 2025</p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Introducción</h2>
            <p>
              En BibliotecaHub, respetamos su privacidad y nos comprometemos a proteger sus datos personales. Esta
              política de privacidad le informará sobre cómo cuidamos sus datos personales cuando visita nuestro sitio
              web y le informará sobre sus derechos de privacidad y cómo la ley le protege.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Datos que Recopilamos</h2>
            <p>
              Podemos recopilar, usar, almacenar y transferir diferentes tipos de datos personales sobre usted, que
              hemos agrupado de la siguiente manera:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>
                <strong>Datos de identidad:</strong> nombre, apellido, nombre de usuario o identificador similar
              </li>
              <li>
                <strong>Datos de contacto:</strong> dirección de correo electrónico, número de teléfono, dirección
                postal
              </li>
              <li>
                <strong>Datos de perfil:</strong> sus intereses, preferencias, comentarios y respuestas a encuestas
              </li>
              <li>
                <strong>Datos de uso:</strong> información sobre cómo utiliza nuestro sitio web y servicios
              </li>
              <li>
                <strong>Datos técnicos:</strong> dirección IP, datos de inicio de sesión, tipo y versión del navegador
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Cómo Utilizamos sus Datos</h2>
            <p>
              Utilizamos sus datos personales solo cuando la ley nos lo permite. Más comúnmente, utilizaremos sus datos
              personales en las siguientes circunstancias:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Para registrar su cuenta y gestionar su membresía</li>
              <li>Para procesar y gestionar sus préstamos y reservas de libros</li>
              <li>Para notificarle sobre vencimientos, disponibilidad de reservas y eventos</li>
              <li>Para mejorar nuestro sitio web, productos/servicios y experiencia del usuario</li>
              <li>Para administrar y proteger nuestro negocio y este sitio web</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Compartir Datos</h2>
            <p>No vendemos sus datos personales a terceros. Podemos compartir sus datos personales con:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Proveedores de servicios que nos ayudan a operar nuestro sitio web y servicios</li>
              <li>Autoridades fiscales, reguladoras u otras autoridades cuando sea requerido por ley</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Seguridad de Datos</h2>
            <p>
              Hemos implementado medidas de seguridad apropiadas para evitar que sus datos personales se pierdan,
              utilicen o accedan de forma no autorizada. Además, limitamos el acceso a sus datos personales a aquellos
              empleados, agentes, contratistas y otros terceros que tengan una necesidad comercial de conocerlos.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Retención de Datos</h2>
            <p>
              Solo conservaremos sus datos personales durante el tiempo necesario para cumplir con los fines para los
              que los recopilamos, incluyendo para satisfacer cualquier requisito legal, contable o de informes.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Sus Derechos Legales</h2>
            <p>
              Bajo ciertas circunstancias, usted tiene derechos bajo las leyes de protección de datos en relación con
              sus datos personales, incluyendo el derecho a:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Solicitar acceso a sus datos personales</li>
              <li>Solicitar la corrección de sus datos personales</li>
              <li>Solicitar la eliminación de sus datos personales</li>
              <li>Oponerse al procesamiento de sus datos personales</li>
              <li>Solicitar la restricción del procesamiento de sus datos personales</li>
              <li>Solicitar la transferencia de sus datos personales</li>
              <li>Retirar el consentimiento en cualquier momento</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">8. Cookies</h2>
            <p>
              Utilizamos cookies y tecnologías similares para mejorar su experiencia de navegación, analizar cómo
              utiliza nuestro sitio y personalizar el contenido. Puede configurar su navegador para rechazar todas o
              algunas cookies, o para alertarle cuando los sitios web establecen o acceden a cookies.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">9. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta política de privacidad de vez en cuando. Le notificaremos cualquier cambio
              publicando la nueva política de privacidad en esta página y, si los cambios son significativos, le
              enviaremos una notificación.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">10. Contacto</h2>
            <p>
              Si tiene alguna pregunta sobre esta política de privacidad o nuestras prácticas de privacidad, por favor
              contáctenos a través de
              <a href="mailto:privacidad@bibliotecahub.com" className="text-primary hover:underline">
                {" "}
                privacidad@bibliotecahub.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
