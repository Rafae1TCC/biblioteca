import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { executeQuery } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

// Componente para mostrar un estado de carga
function LoadingState() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-lg">Cargando detalles del préstamo...</span>
    </div>
  )
}

// Componente para mostrar los detalles del préstamo
async function LoanDetails({ id }: { id: string }) {
  console.log(`[LoanDetailsPage:LoanDetails] Cargando detalles del préstamo ID=${id}`)

  // Fetch loan details with book and user information
  const loans = await executeQuery(
    `
    SELECT p.*, 
           l.titulo as libro_titulo, 
           l.autor as libro_autor,
           l.isbn as libro_isbn,
           u.nombre as usuario_nombre,
           u.apellido as usuario_apellido,
           u.email as usuario_email
    FROM prestamos p
    JOIN libros l ON p.libro_id = l.id
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.id = $1
  `,
    [id],
  ).catch((error) => {
    console.error(`[LoanDetailsPage:LoanDetails] Error al cargar detalles del préstamo ID=${id}:`, error)
    return []
  })

  if (loans.length === 0) {
    console.log(`[LoanDetailsPage:LoanDetails] Préstamo ID=${id} no encontrado, redirigiendo`)
    redirect("/admin/loans?error=Préstamo no encontrado")
  }

  const loan = loans[0]
  console.log(`[LoanDetailsPage:LoanDetails] Préstamo ID=${id} cargado correctamente`)

  const isReservation = loan.notas === "RESERVA"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center space-x-2">
        <Link href="/admin/loans" className="text-sm text-muted-foreground hover:text-foreground">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver a préstamos
          </Button>
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Detalles del Préstamo</h1>
          {isReservation && (
            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              RESERVA
            </div>
          )}
        </div>
        <p className="text-muted-foreground">Información completa del préstamo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-md p-6 space-y-4">
          <h2 className="text-xl font-semibold">Información del Libro</h2>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground">Título:</span>
              <p className="font-medium">{loan.libro_titulo}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Autor:</span>
              <p>{loan.libro_autor}</p>
            </div>
            {loan.libro_isbn && (
              <div>
                <span className="text-muted-foreground">ISBN:</span>
                <p>{loan.libro_isbn}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border rounded-md p-6 space-y-4">
          <h2 className="text-xl font-semibold">Información del Usuario</h2>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground">Nombre:</span>
              <p className="font-medium">
                {loan.usuario_nombre} {loan.usuario_apellido}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p>{loan.usuario_email}</p>
            </div>
          </div>
        </div>

        <div className="border rounded-md p-6 space-y-4 md:col-span-2">
          <h2 className="text-xl font-semibold">Detalles del Préstamo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground">Fecha de Préstamo:</span>
              <p>{new Date(loan.fecha_prestamo).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fecha de Vencimiento:</span>
              <p>{new Date(loan.fecha_vencimiento).toLocaleDateString()}</p>
            </div>
            {loan.fecha_devolucion && (
              <div>
                <span className="text-muted-foreground">Fecha de Devolución:</span>
                <p>{new Date(loan.fecha_devolucion).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Estado:</span>
              <p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    loan.estado === "activo" && isReservation
                      ? "bg-yellow-100 text-yellow-800"
                      : loan.estado === "activo"
                        ? "bg-blue-100 text-blue-800"
                        : loan.estado === "vencido"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                  }`}
                >
                  {loan.estado === "activo" && isReservation
                    ? "RESERVA"
                    : loan.estado === "activo"
                      ? "Activo"
                      : loan.estado === "vencido"
                        ? "Vencido"
                        : "Devuelto"}
                  {isReservation && <AlertTriangle className="ml-1 h-3 w-3" />}
                </span>
              </p>
            </div>
          </div>

          {loan.notas && loan.notas !== "RESERVA" && (
            <div className="mt-4">
              <span className="text-muted-foreground">Notas:</span>
              <p className="mt-1 whitespace-pre-wrap">{loan.notas}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {loan.estado !== "devuelto" && (
          <>
            <Link href={`/admin/loans/return/${loan.id}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {isReservation ? "Confirmar Préstamo" : "Marcar como Devuelto"}
              </Button>
            </Link>
            <Link href={`/admin/loans/edit/${loan.id}`}>
              <Button className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar Préstamo
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default async function LoanDetailsPage({ params }: { params: { id: string } }) {
  console.log(`[LoanDetailsPage] Iniciando renderizado para préstamo ID=${params.id}`)

  const session = await getServerSession(authOptions)
  console.log("[LoanDetailsPage] Sesión:", session ? "Autenticado" : "No autenticado")

  if (!session || session.user.role !== "administrador") {
    console.log("[LoanDetailsPage] Redirigiendo: Usuario no es administrador")
    redirect("/login?callbackUrl=/admin/loans/" + params.id)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAdminPage={true} />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar user={session.user} />
        <main id="contenido-principal" className="flex-1 p-4 md:p-6 lg:p-8">
          <Suspense fallback={<LoadingState />}>
            <LoanDetails id={params.id} />
          </Suspense>
        </main>
      </div>
      <Footer />
    </div>
  )
}
