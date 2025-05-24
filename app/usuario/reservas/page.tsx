import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"
import { BookCover } from "@/components/book-cover"
import { CancelarReservaButton } from "@/components/cancelar-reserva-button"

export default async function ReservasPage() {
  console.log(`[ReservasPage] Iniciando carga de página de reservas`)
  const session = await getServerSession(authOptions)
  console.log(`[ReservasPage] Sesión de usuario verificada: ${session?.user?.email || "No autenticado"}`)

  if (!session) {
    console.log(`[ReservasPage] Usuario no autenticado, redirigiendo a login`)
    redirect("/iniciar-sesion?callbackUrl=/usuario/reservas")
  }

  // Obtener el ID del usuario
  console.log(`[ReservasPage] Consultando ID de usuario para email: ${session.user.email}`)
  const userResult = await executeQuery("SELECT id FROM usuarios WHERE email = $1", [session.user.email])

  if (userResult.length === 0) {
    console.error(`[ReservasPage] Usuario no encontrado para ${session.user.email}`)
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Usuario no encontrado</h1>
            <p className="mb-6">No se encontró tu información de usuario. Por favor, contacta al administrador.</p>
            <Button asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const userId = userResult[0].id
  console.log(`[ReservasPage] ID de usuario encontrado: ${userId}`)

  // Obtener las reservas del usuario
  console.log(`[ReservasPage] Consultando reservas para el usuario ${userId}`)
  const reservas = await executeQuery(
    `SELECT r.*, l.titulo, l.autor, l.imagen_portada, l.portada_url, l.copias_disponibles
     FROM reservas r
     JOIN libros l ON r.libro_id = l.id
     WHERE r.usuario_id = $1
     ORDER BY r.fecha_reserva DESC`,
    [userId],
  )
  console.log(`[ReservasPage] Encontradas ${reservas.length} reservas para el usuario ${userId}`)

  // Cancelar reservas vencidas (más de 1 día)
  console.log(`[ReservasPage] Verificando reservas vencidas para cancelación automática`)
  for (const reserva of reservas) {
    // Usar fecha_vencimiento si existe, de lo contrario calcularla
    const fechaVencimiento = reserva.fecha_vencimiento
      ? new Date(reserva.fecha_vencimiento)
      : (() => {
          const fecha = new Date(reserva.fecha_reserva)
          fecha.setDate(fecha.getDate() + 1)
          return fecha
        })()

    console.log(
      `[ReservasPage] Reserva ID: ${reserva.id}, Estado: ${reserva.estado}, Fecha vencimiento: ${fechaVencimiento.toISOString()}`,
    )

    if (isAfter(new Date(), fechaVencimiento) && reserva.estado === "pendiente") {
      console.log(`[ReservasPage] Reserva ${reserva.id} vencida, procediendo a cancelar`)

      // Iniciar transacción
      console.log(`[ReservasPage] Iniciando transacción para cancelar reserva ${reserva.id}`)
      await executeQuery("BEGIN")

      try {
        // Actualizar estado de la reserva
        console.log(`[ReservasPage] Actualizando estado de la reserva ${reserva.id} a 'cancelada'`)
        await executeQuery("UPDATE reservas SET estado = 'cancelada' WHERE id = $1", [reserva.id])

        // Devolver la copia al inventario
        console.log(`[ReservasPage] Devolviendo copia al inventario para libro ${reserva.libro_id}`)
        await executeQuery("UPDATE libros SET copias_disponibles = copias_disponibles + 1 WHERE id = $1", [
          reserva.libro_id,
        ])

        // Confirmar transacción
        console.log(`[ReservasPage] Confirmando transacción`)
        await executeQuery("COMMIT")
        console.log(`[ReservasPage] Transacción completada con éxito para reserva ${reserva.id}`)
      } catch (error) {
        // Revertir transacción en caso de error
        console.error(`[ReservasPage] Error al cancelar reserva vencida ${reserva.id}:`, error)
        await executeQuery("ROLLBACK")
        console.log(`[ReservasPage] Transacción revertida para reserva ${reserva.id}`)
      }
    }
  }

  // Volver a obtener las reservas después de las actualizaciones
  console.log(`[ReservasPage] Volviendo a consultar reservas después de actualizaciones`)
  const reservasActualizadas = await executeQuery(
    `SELECT r.*, l.titulo, l.autor, l.imagen_portada, l.portada_url, l.copias_disponibles
     FROM reservas r
     JOIN libros l ON r.libro_id = l.id
     WHERE r.usuario_id = $1
     ORDER BY r.fecha_reserva DESC`,
    [userId],
  )
  console.log(`[ReservasPage] Obtenidas ${reservasActualizadas.length} reservas actualizadas`)

  console.log(`[ReservasPage] Renderizando página de reservas`)
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mis Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona tus reservas de libros. Recuerda que las reservas duran solo 1 día.
          </p>
        </div>

        <Button asChild variant="outline" className="mb-6">
          <Link href="/usuario/dashboard" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Link>
        </Button>

        {reservasActualizadas.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">No tienes reservas activas</h2>
            <p className="text-muted-foreground mb-6">
              Explora nuestro catálogo y reserva los libros que te interesen.
            </p>
            <Button asChild>
              <Link href="/catalogo">
                <BookOpen className="mr-2 h-4 w-4" />
                Explorar Catálogo
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservasActualizadas.map((reserva) => {
              // Usar fecha_vencimiento si existe, de lo contrario calcularla
              const fechaReserva = new Date(reserva.fecha_reserva)
              const fechaVencimiento = reserva.fecha_vencimiento
                ? new Date(reserva.fecha_vencimiento)
                : (() => {
                    const fecha = new Date(fechaReserva)
                    fecha.setDate(fecha.getDate() + 1)
                    return fecha
                  })()

              const isExpired = isAfter(new Date(), fechaVencimiento)
              const hoursLeft = Math.max(
                0,
                Math.floor((fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60)),
              )

              console.log(
                `[ReservasPage] Renderizando reserva ID: ${reserva.id}, Libro: ${reserva.titulo}, Estado: ${reserva.estado}, Vencida: ${isExpired}`,
              )

              return (
                <Card key={reserva.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="line-clamp-1">{reserva.titulo}</CardTitle>
                        <CardDescription>{reserva.autor}</CardDescription>
                      </div>
                      <Badge
                        variant={reserva.estado === "pendiente" ? (isExpired ? "destructive" : "default") : "secondary"}
                      >
                        {reserva.estado === "pendiente" ? (isExpired ? "Vencida" : "Pendiente") : "Cancelada"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="aspect-[3/4] relative rounded-md overflow-hidden mb-4">
                      <BookCover
                        imageUrl={reserva.portada_url || reserva.imagen_portada}
                        title={reserva.titulo}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Fecha de reserva:</p>
                        <p className="text-sm text-muted-foreground">{format(fechaReserva, "PPP", { locale: es })}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Fecha límite:</p>
                        <p className="text-sm text-muted-foreground">
                          {format(fechaVencimiento, "PPP", { locale: es })}
                        </p>
                      </div>
                      {reserva.estado === "pendiente" && !isExpired && (
                        <div className="flex items-center gap-2 text-amber-600">
                          <Clock className="h-4 w-4" />
                          <p className="text-sm font-medium">
                            {hoursLeft} {hoursLeft === 1 ? "hora" : "horas"} restantes
                          </p>
                        </div>
                      )}
                      {reserva.estado === "pendiente" && isExpired && (
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <p className="text-sm font-medium">Reserva vencida</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="w-full space-y-2">
                      <Button asChild className="w-full">
                        <Link href={`/catalogo/${reserva.libro_id}`}>Ver Libro</Link>
                      </Button>
                      {reserva.estado === "pendiente" && !isExpired && (
                        // Reemplazamos el Link por nuestro componente de botón
                        <CancelarReservaButton reservaId={reserva.id} />
                      )}
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
