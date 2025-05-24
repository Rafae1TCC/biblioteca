import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { GoogleLoginButton } from "@/components/google-login-button"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { redirect } from "next/navigation"
import { EmailPasswordLoginForm } from "@/components/auth/email-password-login-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Login | BibliotecaHub",
  description: "Inicia sesión en tu cuenta de BibliotecaHub",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string }
}) {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect(searchParams.callbackUrl || "/catalogo")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6" />
            <span>BibliotecaHub</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/catalogo" className="text-muted-foreground hover:text-foreground transition-colors">
              Catálogo
            </Link>
            <Link href="/sobre-nosotros" className="text-muted-foreground hover:text-foreground transition-colors">
              Sobre Nosotros
            </Link>
            <Link href="/contacto" className="text-muted-foreground hover:text-foreground transition-colors">
              Contacto
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-muted/30">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
            <p className="text-muted-foreground">Accede a tu cuenta de BibliotecaHub</p>
          </div>
          {searchParams.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">
                {searchParams.error === "CredentialsSignin"
                  ? "Correo electrónico o contraseña incorrectos"
                  : searchParams.error === "EmailNotVerified"
                    ? "Por favor verifica tu correo electrónico antes de iniciar sesión"
                    : searchParams.error}
              </span>
            </div>
          )}
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50">
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Correo y Contraseña</TabsTrigger>
                <TabsTrigger value="google">Google</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <EmailPasswordLoginForm callbackUrl={searchParams.callbackUrl} />
              </TabsContent>
              <TabsContent value="google">
                <div className="flex flex-col gap-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Inicia sesión con tu cuenta de Google para acceder a todas las funcionalidades de BibliotecaHub
                  </p>
                  <GoogleLoginButton callbackUrl={searchParams.callbackUrl} />
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
              </TabsContent>
            </Tabs>
            <div className="mt-4 text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="/registro" className="text-primary hover:underline underline-offset-4">
                Regístrate
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} BibliotecaHub. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terminos" className="hover:underline">
              Términos
            </Link>
            <Link href="/privacidad" className="hover:underline">
              Privacidad
            </Link>
            <Link href="/contacto" className="hover:underline">
              Contacto
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
