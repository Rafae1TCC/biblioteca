"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface CancelarReservaButtonProps {
  reservaId: number
  className?: string
}

export function CancelarReservaButton({ reservaId, className = "" }: CancelarReservaButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCancelar = async () => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      return
    }

    setIsLoading(true)
    console.log(`[CancelarReservaButton] Iniciando cancelación de reserva ID: ${reservaId}`)

    try {
      // Usamos fetch en lugar de navegación directa
      const response = await fetch(`/api/reservas/cancelar?id=${reservaId}`, {
        method: "POST", // Cambiamos a POST para indicar que es una mutación
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Error al cancelar la reserva")
      }

      console.log(`[CancelarReservaButton] Reserva ${reservaId} cancelada exitosamente`)
      toast({
        title: "Reserva cancelada",
        description: "La reserva ha sido cancelada exitosamente.",
      })

      // Refrescamos la página para mostrar los cambios
      router.refresh()
    } catch (error: any) {
      console.error(`[CancelarReservaButton] Error al cancelar reserva:`, error)
      toast({
        title: "Error",
        description: error.message || "No se pudo cancelar la reserva. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" className={`w-full ${className}`} onClick={handleCancelar} disabled={isLoading}>
      {isLoading ? "Cancelando..." : "Cancelar Reserva"}
    </Button>
  )
}
