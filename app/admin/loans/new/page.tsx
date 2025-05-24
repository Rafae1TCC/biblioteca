import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { LoanForm } from "@/components/admin/loan-form"

export default async function NewLoanPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "administrador") {
    redirect("/login?callbackUrl=/admin/loans/new")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAdminPage={true} />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar user={session.user} />
        <main id="contenido-principal" className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Registrar Nuevo Préstamo</h1>
              <p className="text-muted-foreground">Completa el formulario para registrar un nuevo préstamo.</p>
            </div>

            <LoanForm />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
