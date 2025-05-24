import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { GoogleSignInButton } from "@/components/auth/google-signin-button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Iniciar Sesión | BibliotecaHub",
  description: "Inicia sesión en tu cuenta de BibliotecaHub",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string }
}) {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect(searchParams.callbackUrl || "/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="contenido-principal" className="flex-1 flex items-center justify-center p-4 md:p-8 bg-muted/30">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
            <p className="text-muted-foreground">Accede a tu cuenta de BibliotecaHub</p>
          </div>
          {searchParams.error && (
            <div
              className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">
                {searchParams.error === "OAuthAccountNotLinked"
                  ? "Este correo ya está asociado a otra cuenta. Por favor, inicia sesión con el método que usaste anteriormente."
                  : "Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo."}
              </span>
            </div>
          )}
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50">
            <div className="flex flex-col gap-4">
              <p className="text-center text-sm text-muted-foreground">
                Inicia sesión con tu cuenta de Google para acceder a todas las funcionalidades de BibliotecaHub
              </p>
              <GoogleSignInButton callbackUrl={searchParams.callbackUrl} />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Información</span>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Los usuarios con correo electrónico que termine en @uabc.edu.mx tendrán acceso de administrador.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
