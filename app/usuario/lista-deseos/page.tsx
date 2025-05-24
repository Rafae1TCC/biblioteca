"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Heart, Loader2, BookOpen, ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface Book {
  libro_id: number
  titulo: string
  autor: string
  portada_url: string
  imagen_portada: string
  copias_disponibles: number
  fecha_agregado: string
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [wishlist, setWishlist] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/usuario/lista-deseos")
      return
    }

    if (status === "authenticated") {
      fetchWishlist()
    }
  }, [status, router])

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/lista-deseos/usuario")
      if (response.ok) {
        const data = await response.json()
        setWishlist(data.wishlist)
      } else {
        toast({
          title: "Error",
          description: "No se pudo cargar la lista de deseos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de deseos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (bookId: number) => {
    setRemoving(bookId)
    try {
      const response = await fetch("/api/lista-deseos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ libroId: bookId }),
      })

      if (response.ok) {
        setWishlist((prev) => prev.filter((book) => book.libro_id !== bookId))
        toast({
          title: "Eliminado",
          description: "Libro eliminado de tu lista de deseos",
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar de la lista de deseos")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el libro de la lista de deseos",
        variant: "destructive",
      })
    } finally {
      setRemoving(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <BookOpen className="h-6 w-6" />
              <span>LibraryHub</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Cargando...</h1>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6" />
            <span>LibraryHub</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <Button asChild variant="outline" className="mb-6">
          <Link href="/usuario/dashboard" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
          <h1 className="text-3xl font-bold">Mi Lista de Deseos</h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Tu lista de deseos está vacía</h2>
            <p className="text-muted-foreground mb-6">
              Explora el catálogo y añade libros a tu lista de deseos para verlos aquí.
            </p>
            <Link href="/catalogo">
              <Button>Explorar Catálogo</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((book) => (
              <Card key={book.libro_id} className="overflow-hidden flex flex-col h-full">
                <div className="relative aspect-[2/3] w-full">
                  <Image
                    src={
                      book.portada_url ||
                      book.imagen_portada ||
                      `/placeholder.svg?height=450&width=300&query=Cover of ${book.titulo || "Book"}`
                    }
                    alt={`Portada de ${book.titulo}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={book.copias_disponibles > 0 ? "default" : "secondary"}>
                      {book.copias_disponibles > 0 ? "Disponible" : "No Disponible"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="pt-4 flex-grow">
                  <h3 className="font-semibold text-lg line-clamp-1">{book.titulo}</h3>
                  <p className="text-muted-foreground line-clamp-1">{book.autor}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Añadido el {new Date(book.fecha_agregado).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2 pt-0">
                  <Button asChild variant="secondary" className="flex-1">
                    <Link href={`/catalogo/${book.libro_id}`}>Ver Detalles</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeFromWishlist(book.libro_id)}
                    disabled={removing === book.libro_id}
                  >
                    {removing === book.libro_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} LibraryHub. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terminos" className="hover:underline">
              Términos
            </Link>
            <Link href="/privacidad" className="hover:underline">
              Privacidad
            </Link>
            <Link href="/contacto" className="hover:underline">
              Contacto
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
