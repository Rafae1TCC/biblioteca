import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DeleteBookForm } from "@/components/admin/delete-book-form"
import { executeQuery } from "@/lib/db"

export default async function DeleteBookPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "administrador") {
    redirect("/login?callbackUrl=/admin/books/delete/" + params.id)
  }

  // Fetch book data
  const bookResult = await executeQuery(
    `
    SELECT l.*, 
           (SELECT string_agg(g.nombre, ', ') 
            FROM libros_generos lg 
            JOIN generos g ON lg.genero_id = g.id 
            WHERE lg.libro_id = l.id) as generos
    FROM libros l
    WHERE l.id = $1
    `,
    [params.id],
  ).catch((error) => {
    console.error("Error fetching book:", error)
    return []
  })

  if (!bookResult || bookResult.length === 0) {
    redirect("/admin/books")
  }

  const book = bookResult[0]

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAdminPage={true} />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar user={session.user} />
        <main id="contenido-principal" className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Eliminar Libro</h1>
              <p className="text-muted-foreground">¿Estás seguro de que deseas eliminar el libro "{book.titulo}"?</p>
            </div>

            <DeleteBookForm book={book} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
