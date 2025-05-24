import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Heart, BookMarked, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookCover } from "@/components/book-cover"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export const dynamic = "force-dynamic" // Asegura que la página siempre se renderice en el servidor

async function getUserStats(email: string) {
  try {
    // Obtener ID del usuario
    const userResult = await executeQuery("SELECT id FROM usuarios WHERE email = $1", [email])

    if (userResult.length === 0) {
      return {
        activeLoans: 0,
        reservations: 0,
        wishlistItems: 0,
        overdueLoans: 0,
      }
    }

    const userId = userResult[0].id

    // Obtener préstamos activos (excluyendo reservas)
    const activeLoansResult = await executeQuery(
      "SELECT COUNT(*) as count FROM prestamos WHERE usuario_id = $1 AND estado = 'activo' AND (notas IS NULL OR notas != 'RESERVA')",
      [userId],
    )

    // Obtener préstamos vencidos
    const overdueLoansResult = await executeQuery(
      "SELECT COUNT(*) as count FROM prestamos WHERE usuario_id = $1 AND estado = 'vencido'",
      [userId],
    )

    // Obtener reservas activas
    const reservationsResult = await executeQuery(
      "SELECT COUNT(*) as count FROM reservas WHERE usuario_id = $1 AND estado = 'pendiente'",
      [userId],
    )

    // Obtener items en lista de deseos
    const wishlistResult = await executeQuery("SELECT COUNT(*) as count FROM lista_deseos WHERE usuario_id = $1", [
      userId,
    ])

    return {
      activeLoans: Number.parseInt(activeLoansResult[0].count || "0"),
      reservations: Number.parseInt(reservationsResult[0].count || "0"),
      wishlistItems: Number.parseInt(wishlistResult[0].count || "0"),
      overdueLoans: Number.parseInt(overdueLoansResult[0].count || "0"),
    }
  } catch (error) {
    console.error("Error al obtener estadísticas del usuario:", error)
    return {
      activeLoans: 0,
      reservations: 0,
      wishlistItems: 0,
      overdueLoans: 0,
    }
  }
}

async function getUserData(email: string) {
  try {
    // Obtener ID del usuario
    const userResult = await executeQuery("SELECT id, nombre, apellido FROM usuarios WHERE email = $1", [email])

    if (userResult.length === 0) return null

    const userId = userResult[0].id

    // Obtener préstamos activos (excluyendo reservas)
    const activeLoans = await executeQuery(
      `SELECT p.*, l.titulo, l.autor, l.imagen_portada, l.portada_url
       FROM prestamos p
       JOIN libros l ON p.libro_id = l.id
       WHERE p.usuario_id = $1 AND p.estado = 'activo' AND (p.notas IS NULL OR p.notas != 'RESERVA')
       ORDER BY p.fecha_vencimiento ASC
       LIMIT 3`,
      [userId],
    )

    // Obtener reservas activas
    const reservations = await executeQuery(
      `SELECT r.*, l.titulo, l.autor, l.imagen_portada, l.portada_url
       FROM reservas r
       JOIN libros l ON r.libro_id = l.id
       WHERE r.usuario_id = $1 AND r.estado = 'pendiente'
       ORDER BY r.fecha_reserva DESC
       LIMIT 3`,
      [userId],
    )

    // Obtener lista de deseos
    const wishlist = await executeQuery(
      `SELECT ld.*, l.titulo, l.autor, l.imagen_portada, l.portada_url, l.copias_disponibles
       FROM lista_deseos ld
       JOIN libros l ON ld.libro_id = l.id
       WHERE ld.usuario_id = $1
       ORDER BY ld.fecha_agregado DESC
       LIMIT 3`,
      [userId],
    )

    return {
      user: userResult[0],
      activeLoans,
      reservations,
      wishlist,
    }
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error)
    return null
  }
}

export default async function UserDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/usuario/dashboard")
  }

  const stats = await getUserStats(session.user.email)
  const userData = await getUserData(session.user.email)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bienvenido, {session.user.name}</h1>
          <p className="text-muted-foreground">Gestiona tus préstamos, reservas y lista de deseos desde aquí.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-5 w-5" />
                Préstamos Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.activeLoans}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/usuario/prestamos">Ver Préstamos</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.reservations}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/usuario/reservas">Ver Reservas</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Lista de Deseos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.wishlistItems}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/usuario/lista-deseos">Ver Lista de Deseos</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Clock className="h-5 w-5" />
                Vencidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-destructive">{stats.overdueLoans}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full text-destructive border-destructive" asChild>
                <Link href="/usuario/prestamos?filter=vencidos">Ver Vencidos</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {userData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Préstamos activos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5" />
                  Préstamos Activos
                </CardTitle>
                <CardDescription>Tus préstamos activos más recientes</CardDescription>
              </CardHeader>
              <CardContent>
                {userData.activeLoans.length > 0 ? (
                  <div className="space-y-4">
                    {userData.activeLoans.map((loan) => (
                      <div key={loan.id} className="flex gap-4">
                        <div className="w-16 h-24 flex-shrink-0">
                          <BookCover
                            imageUrl={loan.portada_url || loan.imagen_portada}
                            title={loan.titulo}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-1">{loan.titulo}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{loan.autor}</p>
                          <p className="text-xs mt-1">
                            Vence: {format(new Date(loan.fecha_vencimiento), "PPP", { locale: es })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tienes préstamos activos.</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/usuario/prestamos">Ver Todos</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Reservas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Reservas
                </CardTitle>
                <CardDescription>Tus reservas pendientes</CardDescription>
              </CardHeader>
              <CardContent>
                {userData.reservations.length > 0 ? (
                  <div className="space-y-4">
                    {userData.reservations.map((reservation) => {
                      const fechaVencimiento = reservation.fecha_vencimiento
                        ? new Date(reservation.fecha_vencimiento)
                        : (() => {
                            const fecha = new Date(reservation.fecha_reserva)
                            fecha.setDate(fecha.getDate() + 1)
                            return fecha
                          })()

                      return (
                        <div key={reservation.id} className="flex gap-4">
                          <div className="w-16 h-24 flex-shrink-0">
                            <BookCover
                              imageUrl={reservation.portada_url || reservation.imagen_portada}
                              title={reservation.titulo}
                              className="w-full h-full"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium line-clamp-1">{reservation.titulo}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">{reservation.autor}</p>
                            <p className="text-xs mt-1">Expira: {format(fechaVencimiento, "PPP", { locale: es })}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tienes reservas pendientes.</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/usuario/reservas">Ver Todas</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Lista de deseos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Lista de Deseos
                </CardTitle>
                <CardDescription>Libros que te interesan</CardDescription>
              </CardHeader>
              <CardContent>
                {userData.wishlist.length > 0 ? (
                  <div className="space-y-4">
                    {userData.wishlist.map((item) => (
                      <div key={item.libro_id} className="flex gap-4">
                        <div className="w-16 h-24 flex-shrink-0">
                          <BookCover
                            imageUrl={item.portada_url || item.imagen_portada}
                            title={item.titulo}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-1">{item.titulo}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{item.autor}</p>
                          <p className="text-xs mt-1">
                            {item.copias_disponibles > 0 ? (
                              <span className="text-green-600">Disponible</span>
                            ) : (
                              <span className="text-amber-600">No disponible</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Tu lista de deseos está vacía.</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/usuario/lista-deseos">Ver Todos</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
