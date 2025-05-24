import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="contenido-principal" className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-md text-center">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-bold mt-4">Página no encontrada</h2>
          <p className="text-muted-foreground mt-2 mb-6">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">Volver al Inicio</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/catalogo">Explorar Catálogo</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
