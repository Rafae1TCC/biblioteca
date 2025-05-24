"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface CancelarReservaFormProps {
  reserva: {
    id: string
    libro_id: string
    libro_titulo: string
  }
}

export function CancelarReservaForm({ reserva }: CancelarReservaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const motivo = formData.get("motivo") as string

    try {
      // Cancelar la reserva
      const response = await fetch("/api/admin/reservas/cancelar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservaId: reserva.id,
          motivo,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al cancelar la reserva")
      }

      toast({
        title: "Reserva cancelada",
        description: `La reserva para "${reserva.libro_titulo}" ha sido cancelada correctamente.`,
      })

      // Redirigir a la página de reservas
      router.push("/admin/reservas")
      router.refresh()
    } catch (error) {
      console.error("Error al cancelar reserva:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cancelar la reserva",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="motivo">Motivo de Cancelación (opcional)</Label>
          <Textarea
            id="motivo"
            name="motivo"
            placeholder="Indica el motivo por el que se cancela esta reserva..."
            className="min-h-[100px]"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Volver
          </Button>
          <Button type="submit" variant="destructive" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Confirmar Cancelación"
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
