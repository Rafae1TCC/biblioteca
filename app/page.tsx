export const dynamic = "force-dynamic"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Users } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { SearchBar } from "@/components/search-bar"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="contenido-principal" className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 md:py-24 bg-gradient-to-b from-secondary/50 to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Bienvenido a BibliotecaHub
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Tu sistema digital de gestión de biblioteca. Explora nuestra colección, reserva libros y gestiona tu
                  lista de lectura.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/catalogo">
                  <Button size="lg" className="w-full sm:w-auto">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Explorar Catálogo
                  </Button>
                </Link>
                {!session && (
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Colección Extensa</h3>
                <p className="text-muted-foreground">Accede a miles de libros de diversos géneros y temas.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Reservas Fáciles</h3>
                <p className="text-muted-foreground">Reserva libros en línea y recógelos cuando te convenga.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm border border-border/50 hover:shadow-md transition-shadow lg:col-span-1 md:col-span-2 md:mx-auto md:max-w-md">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gestión Digital</h3>
                <p className="text-muted-foreground">
                  Controla tus préstamos, reservas e historial de lectura en un solo lugar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Comienza a explorar hoy</h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                  Únete a nuestra comunidad de lectores y descubre nuevos mundos a través de los libros.
                </p>
              </div>
              <SearchBar />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
