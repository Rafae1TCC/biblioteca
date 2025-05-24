"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error boundary caught error:", error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-4">
      <h2 className="text-2xl font-bold mb-2">Algo salió mal</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Intentar de nuevo</Button>
        <Button variant="outline" asChild>
          <a href="/">Volver al inicio</a>
        </Button>
      </div>
    </div>
  )
}
