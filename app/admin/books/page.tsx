export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { executeQuery } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { Pagination } from "@/components/ui/pagination"

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "administrador") {
    redirect("/login?callbackUrl=/admin/books")
  }

  // Parámetros de paginación
  const currentPage = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const itemsPerPage = 10
  const offset = (currentPage - 1) * itemsPerPage
  const searchTerm = searchParams.search || ""

  // Consulta para contar el total de libros (para paginación)
  const countQuery = searchTerm
    ? `
      SELECT COUNT(*) as total
      FROM libros l
      WHERE l.titulo ILIKE $1 OR l.autor ILIKE $1
    `
    : `SELECT COUNT(*) as total FROM libros`

  const countParams = searchTerm ? [`%${searchTerm}%`] : []
  const countResult = await executeQuery(countQuery, countParams)
  const totalItems = Number.parseInt(countResult[0].total)

  // Consulta para obtener libros con paginación
  const booksQuery = searchTerm
    ? `
      SELECT l.*, 
             (SELECT string_agg(g.nombre, ', ') 
              FROM libros_generos lg 
              JOIN generos g ON lg.genero_id = g.id 
              WHERE lg.libro_id = l.id) as generos
      FROM libros l
      WHERE l.titulo ILIKE $1 OR l.autor ILIKE $1
      ORDER BY l.titulo ASC
      LIMIT $2 OFFSET $3
    `
    : `
      SELECT l.*, 
             (SELECT string_agg(g.nombre, ', ') 
              FROM libros_generos lg 
              JOIN generos g ON lg.genero_id = g.id 
              WHERE lg.libro_id = l.id) as generos
      FROM libros l
      ORDER BY l.titulo ASC
      LIMIT $1 OFFSET $2
    `

  const booksParams = searchTerm ? [`%${searchTerm}%`, itemsPerPage, offset] : [itemsPerPage, offset]

  const books = await executeQuery(booksQuery, booksParams).catch((error) => {
    console.error("Error fetching books:", error)
    return []
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAdminPage={true} />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar user={session.user} />
        <main id="contenido-principal" className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Libros</h1>
                <p className="text-muted-foreground">Administra el catálogo de libros de la biblioteca.</p>
              </div>
              <Link href="/admin/books/new">
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Añadir Libro
                </Button>
              </Link>
            </div>

            {/* Barra de búsqueda */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <form method="get">
                  <input
                    type="search"
                    name="search"
                    placeholder="Buscar por título o autor..."
                    defaultValue={searchTerm}
                    className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </form>
              </div>
              {searchTerm && (
                <Link href="/admin/books">
                  <Button variant="outline" size="sm">
                    Limpiar
                  </Button>
                </Link>
              )}
            </div>

            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Título</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Autor</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Géneros</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Copias</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {books.length > 0 ? (
                      books.map((book: any) => (
                        <tr
                          key={book.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">{book.titulo}</td>
                          <td className="p-4 align-middle">{book.autor}</td>
                          <td className="p-4 align-middle">{book.generos || "Sin género"}</td>
                          <td className="p-4 align-middle">
                            {book.copias_disponibles}/{book.copias_totales}
                          </td>
                          <td className="p-4 align-middle">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                book.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {book.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/books/edit/${book.id}`}>
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                  <Edit className="h-3.5 w-3.5" />
                                  Editar
                                </Button>
                              </Link>
                              <Link href={`/admin/books/delete/${book.id}`}>
                                <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-500">
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Eliminar
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="h-24 text-center">
                          {searchTerm
                            ? "No se encontraron libros que coincidan con la búsqueda."
                            : "No se encontraron libros."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              baseUrl="/admin/books"
              queryParams={searchTerm ? { search: searchTerm } : {}}
            />

            <div className="text-sm text-muted-foreground">
              Mostrando {books.length} de {totalItems} libros
              {searchTerm && ` para la búsqueda "${searchTerm}"`}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
