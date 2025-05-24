import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ToggleUserStatusForm } from "@/components/admin/toggle-user-status-form"
import { executeQuery } from "@/lib/db"

export default async function ToggleUserStatusPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "administrador") {
    redirect("/login?callbackUrl=/admin/users/toggle-status/" + params.id)
  }

  // Fetch user data
  const users = await executeQuery(
    `
    SELECT id, nombre, apellido, email, rol, estado
    FROM usuarios
    WHERE id = $1
  `,
    [params.id],
  ).catch(() => [])

  if (!users || users.length === 0) {
    notFound()
  }

  const user = users[0]

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAdminPage={true} />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar user={session.user} />
        <main id="contenido-principal" className="flex-1 p-4 md:p-6 lg:p-8">
          <ToggleUserStatusForm user={user} />
        </main>
      </div>
      <Footer />
    </div>
  )
}
