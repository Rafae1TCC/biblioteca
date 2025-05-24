"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookMarked } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface ReservarButtonProps {
  libroId: number
  disponible: boolean
  className?: string
}

export function ReservarButton({ libroId, disponible, className = "" }: ReservarButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Modificar la función handleReservar para incluir logging detallado

  const handleReservar = async () => {
    console.log(`[ReservarButton] Iniciando proceso de reserva para libro ID: ${libroId}`)
    setIsLoading(true)

    try {
      console.log(`[ReservarButton] Enviando solicitud POST a /api/reservas con libroId: ${libroId}`)
      const response = await fetch("/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          libroId,
        }),
      })

      console.log(`[ReservarButton] Respuesta recibida con status: ${response.status}`)
      const data = await response.json()

      if (!response.ok) {
        console.error(`[ReservarButton] Error en la respuesta: ${data.error || "Error desconocido"}`)
        throw new Error(data.error || "Error al reservar el libro")
      }

      console.log(`[ReservarButton] Reserva exitosa: ${data.message}`)
      toast({
        title: "Libro reservado",
        description: data.message || "El libro ha sido reservado exitosamente. La reserva durará 1 día.",
      })

      // Redirigir a la página de reservas
      console.log(`[ReservarButton] Redirigiendo a /usuario/reservas`)
      router.push("/usuario/reservas")
    } catch (error: any) {
      console.error(`[ReservarButton] Excepción capturada: ${error.message}`, error)
      toast({
        title: "Error",
        description: error.message || "No se pudo reservar el libro. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      console.log(`[ReservarButton] Finalizando proceso de reserva (éxito o error)`)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleReservar}
      disabled={!disponible || isLoading}
      className={className}
      variant={disponible ? "default" : "outline"}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Reservando...
        </>
      ) : (
        <>
          <BookMarked className="mr-2 h-4 w-4" />
          {disponible ? "Reservar Libro" : "No Disponible"}
        </>
      )}
    </Button>
  )
}
