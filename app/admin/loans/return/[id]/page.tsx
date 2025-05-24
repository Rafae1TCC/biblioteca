import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ReturnLoanForm } from "@/components/admin/return-loan-form"
import { executeQuery } from "@/lib/db"
import { Suspense } from "react"

// Componente para mostrar un estado de carga
function LoadingState() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-lg">Cargando datos del préstamo...</span>
    </div>
  )
}

// Componente para cargar y mostrar el formulario de devolución
async function ReturnLoanContent({ id }: { id: string }) {
  console.log(`[ReturnLoanPage:ReturnLoanContent] Cargando datos del préstamo ID=${id}`)

  // Verify loan exists and is not already returned
  const loans = await executeQuery(
    `
    SELECT p.*, 
           l.titulo as libro_titulo, 
           u.nombre || ' ' || u.apellido as usuario_nombre,
           u.email as usuario_email
    FROM prestamos p
    JOIN libros l ON p.libro_id = l.id
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.id = $1
  `,
    [id],
  ).then((res) => res || [])

  if (loans.length === 0) {
    console.log(`[ReturnLoanPage:ReturnLoanContent] Préstamo ID=${id} no encontrado, redirigiendo`)
    redirect("/admin/loans?error=Préstamo no encontrado")
  }

  const loan = loans[0]

  if (loan.estado === "devuelto") {
    console.log(`[ReturnLoanPage:ReturnLoanContent] Préstamo ID=${id} ya devuelto, redirigiendo`)
    redirect("/admin/loans?error=Este préstamo ya fue devuelto")
  }

  console.log(`[ReturnLoanPage:ReturnLoanContent] Préstamo ID=${id} cargado correctamente`)

  return <ReturnLoanForm loan={loan} />
}

export default async function ReturnLoanPage({ params }: { params: { id: string } }) {
  console.log(`[ReturnLoanPage] Iniciando renderizado para préstamo ID=${params.id}`)

  const session = await getServerSession(authOptions)
  console.log("[ReturnLoanPage] Sesión:", session ? "Autenticado" : "No autenticado")

  if (!session || session.user.role !== "administrador") {
    console.log("[ReturnLoanPage] Redirigiendo: Usuario no es administrador")
    redirect("/login?callbackUrl=/admin/loans/return/" + params.id)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAdminPage={true} />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar user={session.user} />
        <main id="contenido-principal" className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Registrar Devolución</h1>
              <p className="text-muted-foreground">Marca este préstamo como devuelto o confirma la reserva.</p>
            </div>

            <Suspense fallback={<LoadingState />}>
              <ReturnLoanContent id={params.id} />
            </Suspense>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
