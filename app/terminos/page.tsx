import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Términos y Condiciones | BibliotecaHub",
  description: "Términos y condiciones de uso de BibliotecaHub",
}

export default function TerminosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="contenido-principal" className="flex-1 container py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-muted-foreground mb-6">Última actualización: 1 de mayo de 2025</p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Introducción</h2>
            <p>
              Bienvenido a BibliotecaHub. Estos Términos y Condiciones rigen el uso de nuestro sitio web y servicios. Al
              acceder o utilizar BibliotecaHub, usted acepta estar sujeto a estos términos. Si no está de acuerdo con
              alguna parte de estos términos, no podrá acceder al servicio.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Uso del Servicio</h2>
            <p>
              BibliotecaHub proporciona una plataforma para la gestión de préstamos de libros y recursos bibliotecarios.
              Usted se compromete a utilizar el servicio solo para fines legales y de acuerdo con estos términos.
            </p>
            <p>Está prohibido:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Utilizar el servicio para cualquier propósito ilegal o no autorizado</li>
              <li>Violar cualquier ley o regulación aplicable</li>
              <li>Infringir los derechos de propiedad intelectual u otros derechos de terceros</li>
              <li>Interferir con el funcionamiento normal del servicio</li>
              <li>Intentar acceder a áreas restringidas del sistema</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Cuentas de Usuario</h2>
            <p>
              Para acceder a ciertas funciones del servicio, deberá crear una cuenta. Usted es responsable de mantener
              la confidencialidad de su cuenta y contraseña, y acepta la responsabilidad por todas las actividades que
              ocurran bajo su cuenta.
            </p>
            <p>
              Nos reservamos el derecho de suspender o terminar su cuenta si detectamos actividades que violen estos
              términos.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Préstamos y Reservas</h2>
            <p>Al reservar o tomar prestado un libro a través de BibliotecaHub, usted acepta:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Devolver los materiales en el plazo establecido</li>
              <li>Mantener los materiales en buen estado</li>
              <li>Asumir la responsabilidad por daños o pérdidas</li>
              <li>Pagar las multas correspondientes por retrasos, según las políticas de la biblioteca</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Propiedad Intelectual</h2>
            <p>
              El servicio y su contenido original, características y funcionalidad son propiedad de BibliotecaHub y
              están protegidos por derechos de autor, marcas registradas y otras leyes de propiedad intelectual.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Limitación de Responsabilidad</h2>
            <p>
              En ningún caso BibliotecaHub, sus directores, empleados o agentes serán responsables por cualquier daño
              indirecto, incidental, especial, consecuente o punitivo, incluyendo sin limitación, pérdida de beneficios,
              datos, uso, buena voluntad, u otras pérdidas intangibles, resultantes de su acceso o uso del servicio.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Cambios en los Términos</h2>
            <p>
              Nos reservamos el derecho de modificar o reemplazar estos términos en cualquier momento. Es su
              responsabilidad revisar estos términos periódicamente. Su uso continuado del servicio después de la
              publicación de cualquier modificación constituye la aceptación de dichos cambios.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">8. Contacto</h2>
            <p>
              Si tiene alguna pregunta sobre estos Términos y Condiciones, por favor contáctenos a través de
              <a href="mailto:cia@uabc.edu.mx" className="text-primary hover:underline">
                {" "}
                cia@uabc.edu.mx
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
