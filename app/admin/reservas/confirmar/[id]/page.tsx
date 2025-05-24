export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { executeQuery } from "@/lib/db"
import { ConfirmarReservaForm } from "@/components/admin/confirmar-reserva-form"

export default async function ConfirmarReservaPage({ params }: { params: { id: string } }) {
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

  // Verificar que la reserva esté pendiente
  if (reserva.estado !== "pendiente") {
    redirect("/admin/reservas?error=La reserva no está activa")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAdminPage={true} />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar user={session.user} />
        <main id="contenido-principal" className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Confirmar Reserva</h1>
              <p className="text-muted-foreground">Convierte esta reserva en un préstamo oficial para el usuario.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold mb-4">Detalles de la Reserva</h2>
                <div className="rounded-lg border p-4 space-y-3">
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
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">Usuario:</span> {reserva.usuario_nombre}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {reserva.usuario_email}
                    </p>
                    <p>
                      <span className="font-medium">Fecha de Reserva:</span>{" "}
                      {new Date(reserva.fecha_reserva).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Estado:</span>{" "}
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Pendiente
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Confirmar Préstamo</h2>
                <ConfirmarReservaForm reserva={reserva} />
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
