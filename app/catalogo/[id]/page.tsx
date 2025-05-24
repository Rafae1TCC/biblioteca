import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { BookOpen, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ReservarButton } from "@/components/reservar-button"
import { WishlistButton } from "@/components/wishlist-button"

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const bookId = params.id

  // Obtener detalles del libro
  const books = await executeQuery(
    `SELECT l.*, 
            ARRAY_AGG(g.nombre) AS generos
     FROM libros l
     LEFT JOIN libros_generos lg ON l.id = lg.libro_id
     LEFT JOIN generos g ON lg.genero_id = g.id
     WHERE l.id = $1
     GROUP BY l.id`,
    [bookId],
  )

  if (!books || books.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Libro no encontrado</h1>
            <p className="mb-6">El libro que estás buscando no existe o ha sido eliminado.</p>
            <Button asChild>
              <Link href="/catalogo">Volver al catálogo</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const book = books[0]

  // Determinar la URL de la imagen
  const imageUrl =
    book.portada_url ||
    book.imagen_portada ||
    `/placeholder.svg?height=600&width=400&query=${encodeURIComponent(`Portada de ${book.titulo}`)}`

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-md">
              {imageUrl.startsWith("/") ? (
                // Imagen local o placeholder
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={`Portada de ${book.titulo}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                // Imagen externa (URL completa)
                <div className="w-full h-full">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Portada de ${book.titulo}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <Link
              href="/catalogo"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Volver al catálogo
            </Link>

            <h1 className="text-3xl font-bold mb-2">{book.titulo}</h1>
            <p className="text-xl text-muted-foreground mb-4">{book.autor}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {book.generos &&
                book.generos.filter(Boolean).map((genero: string, index: number) => (
                  <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {genero}
                  </span>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Año</span>
                <span className="font-medium">{book.anio_publicacion || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Editorial</span>
                <span className="font-medium">{book.editorial || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Páginas</span>
                <span className="font-medium">{book.paginas || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">ISBN</span>
                <span className="font-medium">{book.isbn || "N/A"}</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Descripción</h2>
              <p className="text-muted-foreground">
                {book.descripcion || "No hay descripción disponible para este libro."}
              </p>
            </div>

            <div className="flex items-center mb-6">
              <div
                className={`px-4 py-2 rounded-md ${book.copias_disponibles > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {book.copias_disponibles > 0
                  ? `${book.copias_disponibles} ${book.copias_disponibles === 1 ? "copia disponible" : "copias disponibles"}`
                  : "No disponible"}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {session ? (
                <>
                  <ReservarButton libroId={book.id} disponible={book.copias_disponibles > 0} />
                  <WishlistButton libroId={book.id} />
                </>
              ) : (
                <Button asChild>
                  <Link href={`/login?callbackUrl=/catalogo/${book.id}`}>
                    <User className="mr-2 h-4 w-4" />
                    Inicia sesión para reservar
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
