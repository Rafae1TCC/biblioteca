"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ConfirmarReservaFormProps {
  reserva: {
    id: string
    libro_id: string
    usuario_id: string
    libro_titulo: string
    usuario_nombre: string
  }
}

export function ConfirmarReservaForm({ reserva }: ConfirmarReservaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [fechaVencimiento, setFechaVencimiento] = useState<Date | undefined>(
    (() => {
      const date = new Date()
      date.setDate(date.getDate() + 14) // Por defecto, 14 días
      return date
    })(),
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const notas = formData.get("notas") as string

    try {
      // Crear préstamo a partir de la reserva
      const response = await fetch("/api/admin/reservas/confirmar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservaId: reserva.id,
          fechaVencimiento: fechaVencimiento?.toISOString(),
          notas,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al confirmar la reserva")
      }

      toast({
        title: "Reserva confirmada",
        description: `El préstamo para "${reserva.libro_titulo}" ha sido registrado correctamente.`,
      })

      // Redirigir a la página de préstamos
      router.push("/admin/loans")
      router.refresh()
    } catch (error) {
      console.error("Error al confirmar reserva:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al confirmar la reserva",
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
          <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fechaVencimiento && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fechaVencimiento ? format(fechaVencimiento, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={fechaVencimiento}
                onSelect={setFechaVencimiento}
                initialFocus
                disabled={(date) => date < new Date()}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notas">Notas (opcional)</Label>
          <Textarea
            id="notas"
            name="notas"
            placeholder="Añade notas sobre este préstamo..."
            className="min-h-[100px]"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || !fechaVencimiento}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Confirmar Préstamo"
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
