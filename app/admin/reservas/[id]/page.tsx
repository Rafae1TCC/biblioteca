export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { executeQuery } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function DetallesReservaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "administrador") {
    redirect("/login?callbackUrl=/admin/reservas")
  }

  const reservaId = params.id

  // Obtener detalles de la reserva
  const reservaResult = await executeQuery(
    `SELECT r.*, 
            l.titulo as libro_titulo, 
            l.autor as libro_autor,
            l.imagen_portada as libro_imagen,
            l.isbn as libro_isbn,
            l.descripcion as libro_descripcion,
            u.nombre || ' ' || u.apellido as usuario_nombre,
            u.email as usuario_email,
            u.id as usuario_id
     FROM reservas r
     JOIN libros l ON r.libro_id = l.id
     JOIN usuarios u ON r.usuario_id = u.id
     WHERE r.id = $1`,
    [reservaId],
  )

  if (reservaResult.length === 0) {
    redirect("/admin/reservas?error=Reserva no encontrada")
  }

  const reserva = reservaResult[0]

  // Calcular tiempo restante si la reserva está pendiente
  let tiempoRestante = ""
  if (reserva.estado === "pendiente") {
    const fechaInicio = new Date(reserva.fecha_reserva)
    const fechaVencimiento = new Date(fechaInicio)
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 1) // 1 día después

    const ahora = new Date()
    const tiempoRestanteMs = fechaVencimiento.getTime() - ahora.getTime()

    if (tiempoRestanteMs <= 0) {
      tiempoRestante = "Vencida"
    } else {
      const horasRestantes = Math.floor(tiempoRestanteMs / (1000 * 60 * 60))
      const minutosRestantes = Math.floor((tiempoRestanteMs % (1000 * 60 * 60)) / (1000 * 60))
      tiempoRestante = `${horasRestantes}h ${minutosRestantes}m`
    }
  }

  // Obtener historial de reservas del usuario
  const historialReservas = await executeQuery(
    `SELECT r.*, l.titulo as libro_titulo
     FROM reservas r
     JOIN libros l ON r.libro_id = l.id
     WHERE r.usuario_id = $1 AND r.id != $2
     ORDER BY r.fecha_reserva DESC
     LIMIT 5`,
    [reserva.usuario_id, reservaId],
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAdminPage={true} />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar user={session.user} />
        <main id="contenido-principal" className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Detalles de Reserva</h1>
                <p className="text-muted-foreground">Información completa sobre la reserva #{reservaId}</p>
              </div>
              <Link href="/admin/reservas">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Reservas
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h2 className="text-xl font-semibold mb-4">Información de la Reserva</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      {reserva.libro_imagen && (
                        <img
                          src={reserva.libro_imagen || "/placeholder.svg"}
                          alt={reserva.libro_titulo}
                          className="h-24 w-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-medium text-lg">{reserva.libro_titulo}</h3>
                        <p className="text-muted-foreground">{reserva.libro_autor}</p>
                        <p className="text-xs text-muted-foreground">ISBN: {reserva.libro_isbn}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div>
                        <p className="text-sm font-medium">ID de Reserva</p>
                        <p className="text-sm text-muted-foreground">{reserva.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Estado</p>
                        <p>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              reserva.estado === "pendiente" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {reserva.estado === "pendiente" ? "Activa" : "Cancelada"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Fecha de Reserva</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reserva.fecha_reserva).toLocaleString()}
                        </p>
                      </div>
                      {reserva.estado === "pendiente" && (
                        <div>
                          <p className="text-sm font-medium">Tiempo Restante</p>
                          <p className="text-sm font-semibold text-blue-600">{tiempoRestante}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Nombre:</span> {reserva.usuario_nombre}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {reserva.usuario_email}
                    </p>
                    <div className="pt-2">
                      <Link href={`/admin/users/edit/${reserva.usuario_id}`}>
                        <Button variant="outline" size="sm">
                          Ver Perfil Completo
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {reserva.estado === "pendiente" && (
                  <div className="flex gap-4">
                    <Link href={`/admin/reservas/confirmar/${reserva.id}`} className="flex-1">
                      <Button className="w-full flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Confirmar Préstamo
                      </Button>
                    </Link>
                    <Link href={`/admin/reservas/cancelar/${reserva.id}`} className="flex-1">
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Cancelar Reserva
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h2 className="text-xl font-semibold mb-4">Descripción del Libro</h2>
                  <p className="text-sm text-muted-foreground">{reserva.libro_descripcion}</p>
                </div>

                <div className="rounded-lg border p-4">
                  <h2 className="text-xl font-semibold mb-4">Historial de Reservas del Usuario</h2>
                  {historialReservas.length > 0 ? (
                    <div className="space-y-3">
                      {historialReservas.map((item: any) => (
                        <div key={item.id} className="border-b pb-2 last:border-0">
                          <p className="font-medium">{item.libro_titulo}</p>
                          <div className="flex justify-between items-center text-sm">
                            <p className="text-muted-foreground">{new Date(item.fecha_reserva).toLocaleDateString()}</p>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                item.estado === "pendiente" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.estado === "pendiente" ? "Activa" : "Cancelada"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Este usuario no tiene otras reservas en el sistema.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
