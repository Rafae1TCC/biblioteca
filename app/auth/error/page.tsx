import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Error de Autenticación | BibliotecaHub",
  description: "Ha ocurrido un error durante el proceso de autenticación",
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorMessage = getErrorMessage(searchParams.error)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="contenido-principal" className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Error de Autenticación</h1>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/auth/signin">Intentar de nuevo</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function getErrorMessage(error?: string): string {
  switch (error) {
    case "OAuthSignin":
      return "Error al iniciar el proceso de autenticación con Google."
    case "OAuthCallback":
      return "Error al procesar la respuesta de Google."
    case "OAuthCreateAccount":
      return "Error al crear la cuenta de usuario."
    case "EmailCreateAccount":
      return "Error al crear la cuenta con este correo electrónico."
    case "Callback":
      return "Error durante el proceso de autenticación."
    case "OAuthAccountNotLinked":
      return "Este correo ya está asociado a otra cuenta. Por favor, inicia sesión con el método que usaste anteriormente."
    case "EmailSignin":
      return "Error al enviar el correo de inicio de sesión."
    case "CredentialsSignin":
      return "Las credenciales proporcionadas no son válidas."
    case "SessionRequired":
      return "Necesitas iniciar sesión para acceder a esta página."
    default:
      return "Ha ocurrido un error durante el proceso de autenticación. Por favor, inténtalo de nuevo."
  }
}
