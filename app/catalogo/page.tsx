export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { Search, Filter, BookOpen, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSession } from "@/lib/mock-auth"
import { executeQuery } from "@/lib/db"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

async function getLibros(search?: string) {
  let query = `
    SELECT l.*, 
           (SELECT string_agg(g.nombre, ', ') 
            FROM libros_generos lg 
            JOIN generos g ON lg.genero_id = g.id 
            WHERE lg.libro_id = l.id) as generos
    FROM libros l
    WHERE l.activo = true
  `

  const params = []

  if (search && search.trim() !== "") {
    const searchTerm = `%${search}%`
    query += ` AND (
      LOWER(l.titulo) LIKE LOWER($1) OR
      LOWER(l.autor) LIKE LOWER($1) OR
      LOWER(l.descripcion) LIKE LOWER($1)
    )`
    params.push(searchTerm)
  }

  query += ` ORDER BY l.titulo`

  return await executeQuery(query, params)
}

export default async function Catalogo({ searchParams }: { searchParams: { search?: string } }) {
  const session = await getSession()
  const search = searchParams.search || ""
  const libros = await getLibros(search)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="contenido-principal" className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col gap-8">
          {/* Encabezado y descripción */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              {search ? `Resultados para "${search}"` : "Catálogo de Libros"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {search
                ? `Se encontraron ${libros.length} libros que coinciden con tu búsqueda.`
                : "Explora nuestra colección de libros y descubre tu próxima aventura literaria."}
            </p>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="bg-card rounded-lg shadow-sm border p-4 sticky top-4 z-10 backdrop-blur-sm bg-opacity-90">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, autor o palabra clave..."
                  className="pl-10 bg-background/50"
                  defaultValue={search}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[180px] bg-background/50">
                    <SelectValue placeholder="Género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Géneros</SelectItem>
                    <SelectItem value="ficcion">Ficción</SelectItem>
                    <SelectItem value="ciencia-ficcion">Ciencia Ficción</SelectItem>
                    <SelectItem value="fantasia">Fantasía</SelectItem>
                    <SelectItem value="romance">Romance</SelectItem>
                    <SelectItem value="misterio">Misterio</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="ml-auto sm:ml-0 bg-background/50">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filtrar</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Cuadrícula de libros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {libros.map((libro: any) => (
              <Link href={`/catalogo/${libro.id}`} key={libro.id} className="group h-full">
                <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg border-transparent hover:border-primary/20 group-hover:translate-y-[-5px]">
                  {/* Portada del libro con efecto de hover */}
                  <div className="relative">
                    <div className="aspect-[2/3] overflow-hidden">
                      <Image
                        src={
                          libro.portada_url ||
                          libro.imagen_portada ||
                          `/placeholder.svg?height=450&width=300&query=Portada de ${libro.titulo || "/placeholder.svg"}`
                        }
                        alt={`Portada de ${libro.titulo}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        priority={true}
                      />
                    </div>

                    {/* Indicador de disponibilidad */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={libro.copias_disponibles > 0 ? "default" : "secondary"}
                        className="shadow-md opacity-90"
                      >
                        {libro.copias_disponibles > 0 ? "Disponible" : "Prestado"}
                      </Badge>
                    </div>

                    {/* Overlay con información adicional en hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <h3 className="text-white font-bold text-lg line-clamp-2 mb-1">{libro.titulo}</h3>
                      <p className="text-white/90 text-sm">{libro.autor}</p>
                    </div>
                  </div>

                  {/* Información del libro */}
                  <CardContent className="flex-1 p-4">
                    <h3 className="font-semibold text-lg line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {libro.titulo}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2">{libro.autor}</p>

                    {/* Metadatos del libro */}
                    <div className="flex flex-wrap gap-y-2 text-xs text-muted-foreground mb-3">
                      {libro.anio_publicacion && (
                        <div className="flex items-center mr-4">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{libro.anio_publicacion}</span>
                        </div>
                      )}
                      {libro.paginas && (
                        <div className="flex items-center mr-4">
                          <BookOpen className="h-3 w-3 mr-1" />
                          <span>{libro.paginas} págs.</span>
                        </div>
                      )}
                    </div>

                    {/* Géneros */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {libro.generos &&
                        libro.generos
                          .split(", ")
                          .slice(0, 3)
                          .map((genero: string) => (
                            <Badge key={genero} variant="outline" className="text-xs px-2 py-0.5">
                              {genero}
                            </Badge>
                          ))}
                      {libro.generos && libro.generos.split(", ").length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          +{libro.generos.split(", ").length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Descripción */}
                    <p className="text-sm line-clamp-3 text-muted-foreground">{libro.descripcion}</p>
                  </CardContent>

                  {/* Botón de acción */}
                  <CardFooter className="p-4 pt-0">
                    <Button variant="default" className="w-full" disabled={libro.copias_disponibles <= 0}>
                      {libro.copias_disponibles > 0 ? "Ver detalles" : "No disponible"}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          {/* Mensaje si no hay libros */}
          {libros.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No se encontraron libros</h3>
              <p className="text-muted-foreground">Intenta con otros criterios de búsqueda o vuelve más tarde.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
