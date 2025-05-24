"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Upload, X, Check, ArrowLeft, Plus, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface BookFormProps {
  bookData?: any
}

interface Genero {
  id: number
  nombre: string
}

export function BookForm({ bookData }: BookFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [coverPreview, setCoverPreview] = useState<string | null>(bookData?.portada_url || null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [generos, setGeneros] = useState<Genero[]>([])
  const [isLoadingGeneros, setIsLoadingGeneros] = useState(true)
  const [searchGenero, setSearchGenero] = useState("")
  const [nuevoGenero, setNuevoGenero] = useState("")
  const [selectedGeneros, setSelectedGeneros] = useState<string[]>([])

  const [formData, setFormData] = useState({
    titulo: bookData?.titulo || "",
    autor: bookData?.autor || "",
    anio_publicacion: bookData?.anio_publicacion?.toString() || "",
    editorial: bookData?.editorial || "",
    isbn: bookData?.isbn || "",
    descripcion: bookData?.descripcion || "",
    copias_totales: bookData?.copias_totales?.toString() || "1",
    copias_disponibles: bookData?.copias_disponibles?.toString() || "1",
    paginas: bookData?.paginas?.toString() || "",
    activo: bookData?.activo !== false, // Si no está definido, asumimos que está activo
  })

  // Cargar géneros al iniciar
  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        const response = await fetch("/api/genres")
        if (!response.ok) {
          throw new Error("Error al cargar géneros")
        }
        const data = await response.json()
        setGeneros(data.genres)

        // Si estamos editando un libro, inicializar los géneros seleccionados
        if (bookData?.generos) {
          const generosArray = bookData.generos
            .split(",")
            .map((g: string) => g.trim())
            .filter((g: string) => g !== "")
          setSelectedGeneros(generosArray)
        }
      } catch (err) {
        console.error("Error al cargar géneros:", err)
      } finally {
        setIsLoadingGeneros(false)
      }
    }

    fetchGeneros()
  }, [bookData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, activo: checked }))
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (JPEG, PNG, etc.)")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5MB")
      return
    }

    setCoverFile(file)
    const objectUrl = URL.createObjectURL(file)
    setCoverPreview(objectUrl)
    setError("")

    return () => URL.revokeObjectURL(objectUrl)
  }

  const removeCover = () => {
    setCoverPreview(null)
    setCoverFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const toggleGenero = (genero: string) => {
    setSelectedGeneros((prev) => {
      if (prev.includes(genero)) {
        return prev.filter((g) => g !== genero)
      } else {
        return [...prev, genero]
      }
    })
  }

  const addNuevoGenero = () => {
    if (!nuevoGenero.trim()) return

    // Verificar si ya existe en la lista de seleccionados
    if (selectedGeneros.includes(nuevoGenero.trim())) {
      return
    }

    setSelectedGeneros((prev) => [...prev, nuevoGenero.trim()])
    setNuevoGenero("")
  }

  const removeGenero = (genero: string) => {
    setSelectedGeneros((prev) => prev.filter((g) => g !== genero))
  }

  const filteredGeneros = generos.filter((genero) => genero.nombre.toLowerCase().includes(searchGenero.toLowerCase()))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Procesar datos del formulario
      let portada_url = bookData?.portada_url || null

      // Si hay un nuevo archivo de portada, subirlo
      if (coverFile) {
        try {
          // Crear un FormData para enviar el archivo
          const formData = new FormData()
          formData.append("file", coverFile)

          // Enviar el archivo al servidor para que lo procese
          const uploadResponse = await fetch("/api/upload/book-cover", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json()
            throw new Error(errorData.error || "Error al subir la portada")
          }

          const uploadResult = await uploadResponse.json()
          portada_url = uploadResult.url

          console.log("Portada subida exitosamente:", portada_url)
        } catch (uploadError: any) {
          console.error("Error al subir la portada:", uploadError)
          setError(`Error al subir la portada: ${uploadError.message}`)
          setIsSubmitting(false)
          return
        }
      }

      // Convertir datos a los tipos correctos
      const processedData = {
        ...formData,
        anio_publicacion: Number.parseInt(formData.anio_publicacion),
        copias_totales: Number.parseInt(formData.copias_totales),
        copias_disponibles: Number.parseInt(formData.copias_disponibles),
        paginas: formData.paginas ? Number.parseInt(formData.paginas) : null,
        generos: selectedGeneros,
        portada_url,
      }

      // Determinar si es una creación o actualización
      const url = bookData ? `/api/books/${bookData.id}` : "/api/books"
      const method = bookData ? "PUT" : "POST"

      console.log(`Enviando datos al servidor (${method}):`, JSON.stringify(processedData))

      // Enviar datos al servidor
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error del servidor:", errorData)
        throw new Error(errorData.error || `Error al ${bookData ? "actualizar" : "crear"} el libro`)
      }

      const result = await response.json()
      console.log("Respuesta del servidor:", result)

      setSuccess(bookData ? "Libro actualizado correctamente" : "Libro creado correctamente")

      // Redireccionar después de un breve retraso
      setTimeout(() => {
        router.push("/admin/books")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Ocurrió un error inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                placeholder="Título del libro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="autor">Autor *</Label>
              <Input
                id="autor"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                required
                placeholder="Nombre del autor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio_publicacion">Año de Publicación *</Label>
              <Input
                id="anio_publicacion"
                name="anio_publicacion"
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                value={formData.anio_publicacion}
                onChange={handleChange}
                required
                placeholder="Ej: 2023"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editorial">Editorial</Label>
              <Input
                id="editorial"
                name="editorial"
                value={formData.editorial}
                onChange={handleChange}
                placeholder="Nombre de la editorial"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="Ej: 978-3-16-148410-0"
              />
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
              <Label htmlFor="copias_totales">Copias Totales *</Label>
              <Input
                id="copias_totales"
                name="copias_totales"
                type="number"
                min="0"
                value={formData.copias_totales}
                onChange={handleChange}
                required
                placeholder="Número total de copias"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copias_disponibles">Copias Disponibles *</Label>
              <Input
                id="copias_disponibles"
                name="copias_disponibles"
                type="number"
                min="0"
                max={formData.copias_totales}
                value={formData.copias_disponibles}
                onChange={handleChange}
                required
                placeholder="Número de copias disponibles"
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
              placeholder="Descripción o sinopsis del libro"
            />
          </div>

          {/* Sección de Géneros */}
          <div className="space-y-4">
            <Label>Géneros</Label>

            {/* Géneros seleccionados */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedGeneros.length > 0 ? (
                selectedGeneros.map((genero) => (
                  <Badge key={genero} className="flex items-center gap-1 px-3 py-1">
                    {genero}
                    <button
                      type="button"
                      onClick={() => removeGenero(genero)}
                      className="ml-1 text-xs hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay géneros seleccionados</p>
              )}
            </div>

            {/* Añadir nuevo género */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Añadir nuevo género"
                value={nuevoGenero}
                onChange={(e) => setNuevoGenero(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addNuevoGenero}
                disabled={!nuevoGenero.trim()}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Añadir
              </Button>
            </div>

            {/* Buscador de géneros */}
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar géneros..."
                value={searchGenero}
                onChange={(e) => setSearchGenero(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Lista de géneros predefinidos */}
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
              {isLoadingGeneros ? (
                <p className="text-center text-muted-foreground">Cargando géneros...</p>
              ) : filteredGeneros.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredGeneros.map((genero) => (
                    <div key={genero.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`genero-${genero.id}`}
                        checked={selectedGeneros.includes(genero.nombre)}
                        onCheckedChange={() => toggleGenero(genero.nombre)}
                      />
                      <label htmlFor={`genero-${genero.id}`} className="text-sm cursor-pointer">
                        {genero.nombre}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No se encontraron géneros</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Portada del Libro</Label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1">
                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="portada"
                    ref={fileInputRef}
                    onChange={handleCoverChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {!coverPreview ? (
                    <div className="py-8">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Subir Portada
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">Formatos: JPG, PNG. Máximo 5MB</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <Image
                        src={coverPreview || "/placeholder.svg"}
                        alt="Vista previa de portada"
                        width={200}
                        height={300}
                        className="mx-auto object-cover rounded-md"
                        style={{ maxHeight: "300px", width: "auto" }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeCover}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="activo" checked={formData.activo} onCheckedChange={handleSwitchChange} />
                    <Label htmlFor="activo">Libro Activo</Label>
                    {formData.activo ? (
                      <Badge variant="default">Visible en catálogo</Badge>
                    ) : (
                      <Badge variant="secondary">Oculto en catálogo</Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Los libros inactivos no aparecerán en el catálogo público, pero se mantendrán en la base de datos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>

            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? "Guardando..." : bookData ? "Actualizar" : "Crear Libro"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
