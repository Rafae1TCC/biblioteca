"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Check, ArrowLeft, Trash2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface DeleteBookFormProps {
  book: any
}

export function DeleteBookForm({ book }: DeleteBookFormProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleDelete = async () => {
    setIsDeleting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar el libro")
      }

      setSuccess("Libro eliminado correctamente")

      // Redireccionar después de un breve retraso
      setTimeout(() => {
        router.push("/admin/books")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Ocurrió un error inesperado")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200 mb-6">
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {book.portada_url && (
            <div className="flex-shrink-0">
              <Image
                src={book.portada_url || "/placeholder.svg"}
                alt={book.titulo}
                width={150}
                height={225}
                className="object-cover rounded-md"
              />
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-xl font-semibold">{book.titulo}</h2>
            <p className="text-muted-foreground">Autor: {book.autor}</p>
            {book.generos && <p className="text-muted-foreground">Géneros: {book.generos}</p>}
            <p className="text-muted-foreground">Año: {book.anio_publicacion}</p>
            <p className="text-muted-foreground">ISBN: {book.isbn || "No especificado"}</p>
            <p className="text-muted-foreground">
              Copias: {book.copias_disponibles}/{book.copias_totales}
            </p>

            <Alert variant="destructive" className="mt-6 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el libro de la base de datos.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
