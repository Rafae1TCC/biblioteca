"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface BookFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (bookData: any) => Promise<void>
  book?: any
  title: string
}

export function BookFormModal({ isOpen, onClose, onSubmit, book, title }: BookFormModalProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    anio_publicacion: "",
    editorial: "",
    isbn: "",
    descripcion: "",
    copias_totales: "1",
    copias_disponibles: "1",
    paginas: "",
    generos: "",
    activo: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (book) {
      setFormData({
        titulo: book.titulo || "",
        autor: book.autor || "",
        anio_publicacion: book.anio_publicacion?.toString() || "",
        editorial: book.editorial || "",
        isbn: book.isbn || "",
        descripcion: book.descripcion || "",
        copias_totales: book.copias_totales?.toString() || "1",
        copias_disponibles: book.copias_disponibles?.toString() || "1",
        paginas: book.paginas?.toString() || "",
        generos: book.generos || "",
        activo: book.activo !== false, // Si no está definido, asumimos que está activo
      })
    } else {
      // Reset form for new book
      setFormData({
        titulo: "",
        autor: "",
        anio_publicacion: "",
        editorial: "",
        isbn: "",
        descripcion: "",
        copias_totales: "1",
        copias_disponibles: "1",
        paginas: "",
        generos: "",
        activo: true,
      })
    }
  }, [book, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, activo: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Convert string values to appropriate types
      const processedData = {
        ...formData,
        anio_publicacion: Number.parseInt(formData.anio_publicacion),
        copias_totales: Number.parseInt(formData.copias_totales),
        copias_disponibles: Number.parseInt(formData.copias_disponibles),
        paginas: formData.paginas ? Number.parseInt(formData.paginas) : null,
        generos: formData.generos
          .split(",")
          .map((g) => g.trim())
          .filter((g) => g !== ""),
      }

      await onSubmit(processedData)
      onClose()
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("Ocurrió un error al guardar el libro. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="autor">Autor</Label>
              <Input id="autor" name="autor" value={formData.autor} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio_publicacion">Año de Publicación</Label>
              <Input
                id="anio_publicacion"
                name="anio_publicacion"
                type="number"
                value={formData.anio_publicacion}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editorial">Editorial</Label>
              <Input id="editorial" name="editorial" value={formData.editorial} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" name="isbn" value={formData.isbn} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paginas">Páginas</Label>
              <Input
                id="paginas"
                name="paginas"
                type="number"
                min="1"
                value={formData.paginas}
                onChange={handleChange}
                placeholder="Número de páginas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="generos">Géneros (separados por comas)</Label>
              <Input
                id="generos"
                name="generos"
                value={formData.generos}
                onChange={handleChange}
                placeholder="Ficción, Aventura, Fantasía"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copias_totales">Copias Totales</Label>
              <Input
                id="copias_totales"
                name="copias_totales"
                type="number"
                min="0"
                value={formData.copias_totales}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copias_disponibles">Copias Disponibles</Label>
              <Input
                id="copias_disponibles"
                name="copias_disponibles"
                type="number"
                min="0"
                max={formData.copias_totales}
                value={formData.copias_disponibles}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="activo" checked={formData.activo} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="activo">Libro Activo</Label>
            {formData.activo ? (
              <Badge variant="default">Visible en catálogo</Badge>
            ) : (
              <Badge variant="secondary">Oculto en catálogo</Badge>
            )}
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Libro"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
