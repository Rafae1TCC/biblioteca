"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { BookmarkIcon, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  observaciones: z.string().optional(),
  extenderPrestamo: z.boolean().optional(),
})

interface ReturnLoanFormProps {
  loan: {
    id: number
    usuario_nombre: string
    usuario_email: string
    libro_titulo: string
    libro_id: number
    fecha_prestamo: string
    fecha_vencimiento: string
    estado: string
    notas: string | null
  }
}

export function ReturnLoanForm({ loan }: ReturnLoanFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isReservation = loan.notas === "RESERVA"

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      observaciones: "",
      extenderPrestamo: false,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true)
    setError(null)

    try {
      console.log(
        `[ReturnLoanForm] Iniciando ${isReservation ? "confirmación de reserva" : "devolución"} para préstamo ID=${loan.id}`,
      )
      console.log(`[ReturnLoanForm] Datos del formulario:`, values)

      const response = await fetch(`/api/loans/${loan.id}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          observaciones: values.observaciones,
          extenderPrestamo: isReservation ? true : values.extenderPrestamo,
          esReserva: isReservation,
        }),
      })

      console.log(`[ReturnLoanForm] Respuesta: status=${response.status}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`[ReturnLoanForm] Error en respuesta:`, errorData)
        throw new Error(errorData.error || "Error al procesar la solicitud")
      }

      const responseData = await response.json()
      console.log(`[ReturnLoanForm] Datos de respuesta:`, responseData)

      toast({
        title: isReservation ? "Préstamo confirmado" : "Devolución registrada",
        description: isReservation
          ? "La reserva ha sido convertida en un préstamo regular"
          : "El libro ha sido devuelto correctamente",
      })

      router.push("/admin/loans")
      router.refresh()
    } catch (error: any) {
      console.error(`[ReturnLoanForm] Error:`, error)
      setError(error.message || "No se pudo procesar la solicitud")
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la solicitud",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{isReservation ? "Confirmar Préstamo" : "Registrar Devolución"}</CardTitle>
          {isReservation && (
            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs flex items-center">
              <BookmarkIcon className="h-3 w-3 mr-1" />
              RESERVA
            </div>
          )}
        </div>
        <CardDescription>
          {isReservation
            ? "Confirma la reserva para convertirla en un préstamo regular"
            : "Registra la devolución del libro prestado"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-sm font-medium">Libro</h3>
            <p className="text-sm">{loan.libro_titulo}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Usuario</h3>
            <p className="text-sm">{loan.usuario_nombre}</p>
            <p className="text-xs text-muted-foreground">{loan.usuario_email}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Fecha de Préstamo</h3>
              <p className="text-sm">{new Date(loan.fecha_prestamo).toLocaleDateString("es-ES")}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Fecha de Vencimiento</h3>
              <p className="text-sm">{new Date(loan.fecha_vencimiento).toLocaleDateString("es-ES")}</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        isReservation
                          ? "Observaciones sobre la confirmación del préstamo"
                          : "Observaciones sobre el estado del libro devuelto"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isReservation && (
              <FormField
                control={form.control}
                name="extenderPrestamo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Extender préstamo</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Marcar esta opción si el libro será prestado nuevamente al mismo usuario
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {isReservation && (
              <div className="rounded-md border p-4 bg-yellow-50">
                <p className="text-sm">
                  Esta es una <strong>reserva</strong> que durará solo un día. Al confirmar, se convertirá en un
                  préstamo regular con una duración de 14 días.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/loans")} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : isReservation ? (
                  "Confirmar Préstamo"
                ) : (
                  "Registrar Devolución"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
