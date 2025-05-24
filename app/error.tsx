"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ClientHeader } from "@/components/client-header"
import { Footer } from "@/components/footer"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen flex-col">
          <ClientHeader />
          <main id="contenido-principal" className="flex-1 flex items-center justify-center p-4 md:p-8">
            <div className="max-w-md text-center">
              <h1 className="text-3xl font-bold mb-2">Algo salió mal</h1>
              <p className="text-muted-foreground mb-6">
                Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => reset()}>Intentar de nuevo</Button>
                <Button variant="outline" asChild>
                  <a href="/">Volver al inicio</a>
                </Button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
