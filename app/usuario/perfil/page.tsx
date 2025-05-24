import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { executeQuery } from "@/lib/db"

export const metadata = {
  title: "Mi Perfil | BibliotecaHub",
  description: "Gestiona tu perfil de usuario en BibliotecaHub",
}

async function getUserData(email: string) {
  try {
    const userData = await executeQuery(
      `SELECT u.*, 
        (SELECT COUNT(*) FROM prestamos WHERE usuario_id = u.id AND estado = 'activo') as prestamos_activos,
        (SELECT COUNT(*) FROM reservas WHERE usuario_id = u.id AND estado = 'pendiente') as reservas_pendientes,
        (SELECT COUNT(*) FROM prestamos WHERE usuario_id = u.id AND estado = 'devuelto') as libros_leidos,
        (SELECT COUNT(*) FROM lista_deseos WHERE usuario_id = u.id) as libros_deseados
      FROM usuarios u 
      WHERE u.email = $1`,
      [email],
    )

    if (userData.length === 0) {
      return null
    }

    return userData[0]
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error)
    return null
  }
}

export default async function PerfilPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/usuario/perfil")
  }

  const userData = await getUserData(session.user.email || "")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="contenido-principal" className="flex-1 container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

          <div className="grid gap-6 md:grid-cols-[250px_1fr]">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={session.user.image || ""} alt={session.user.name || "Usuario"} />
                <AvatarFallback className="text-2xl">
                  {session.user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-semibold">{session.user.name}</h2>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
                <p className="text-sm mt-1">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {session.user.role === "administrador" ? "Administrador" : "Usuario"}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Tu información básica de perfil</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="divide-y divide-border/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 py-3">
                      <dt className="text-sm font-medium text-muted-foreground">Nombre</dt>
                      <dd className="text-sm">{userData?.nombre || session.user.name?.split(" ")[0] || "N/A"}</dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 py-3">
                      <dt className="text-sm font-medium text-muted-foreground">Apellido</dt>
                      <dd className="text-sm">
                        {userData?.apellido || session.user.name?.split(" ").slice(1).join(" ") || "N/A"}
                      </dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 py-3">
                      <dt className="text-sm font-medium text-muted-foreground">Correo Electrónico</dt>
                      <dd className="text-sm">{session.user.email}</dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 py-3">
                      <dt className="text-sm font-medium text-muted-foreground">Tipo de Cuenta</dt>
                      <dd className="text-sm">{session.user.role === "administrador" ? "Administrador" : "Usuario"}</dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 py-3">
                      <dt className="text-sm font-medium text-muted-foreground">Fecha de Registro</dt>
                      <dd className="text-sm">
                        {userData?.fecha_registro ? new Date(userData.fecha_registro).toLocaleDateString() : "N/A"}
                      </dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 py-3">
                      <dt className="text-sm font-medium text-muted-foreground">Último Acceso</dt>
                      <dd className="text-sm">
                        {userData?.ultimo_acceso ? new Date(userData.ultimo_acceso).toLocaleDateString() : "N/A"}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                  <CardDescription>Resumen de tu actividad en la biblioteca</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-2xl font-bold">{userData?.prestamos_activos || 0}</span>
                      <span className="text-sm text-muted-foreground">Préstamos Activos</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-2xl font-bold">{userData?.reservas_pendientes || 0}</span>
                      <span className="text-sm text-muted-foreground">Reservas Pendientes</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-2xl font-bold">{userData?.libros_leidos || 0}</span>
                      <span className="text-sm text-muted-foreground">Libros Leídos</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-2xl font-bold">{userData?.libros_deseados || 0}</span>
                      <span className="text-sm text-muted-foreground">Lista de Deseos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
