export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { executeQuery } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Info, AlertTriangle, Search } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pagination } from "@/components/ui/pagination"

export default async function AdminReservasPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; estado?: string; tab?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "administrador") {
    redirect("/login?callbackUrl=/admin/reservas")
  }

  // Parámetros de paginación y filtrado
  const currentPage = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const itemsPerPage = 10
  const offset = (currentPage - 1) * itemsPerPage
  const searchTerm = searchParams.search || ""
  const estadoFilter = searchParams.estado || ""
  const activeTab = searchParams.tab || "active-reservations"

  // Construir condiciones de filtrado para reservas
  const whereConditions = []
  const queryParams = []
  let paramIndex = 1

  if (searchTerm) {
    whereConditions.push(
      `(l.titulo ILIKE $${paramIndex} OR u.nombre ILIKE $${paramIndex} OR u.apellido ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`,
    )
    queryParams.push(`%${searchTerm}%`)
    paramIndex++
  }

  if (estadoFilter) {
    whereConditions.push(`r.estado = $${paramIndex}`)
    queryParams.push(estadoFilter)
    paramIndex++
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

  // Consulta para contar el total de reservas
  const countQuery = `
    SELECT COUNT(*) as total
    FROM reservas r
    JOIN libros l ON r.libro_id = l.id
    JOIN usuarios u ON r.usuario_id = u.id
    ${whereClause}
  `

  const countResult = await executeQuery(countQuery, queryParams)
  const totalItems = Number.parseInt(countResult[0].total)

  // Obtener todas las reservas con información del libro y usuario
  const reservasQuery = `
    SELECT r.*, 
           l.titulo as libro_titulo, 
           l.autor as libro_autor,
           l.imagen_portada as libro_imagen,
           u.nombre || ' ' || u.apellido as usuario_nombre,
           u.email as usuario_email
    FROM reservas r
    JOIN libros l ON r.libro_id = l.id
    JOIN usuarios u ON r.usuario_id = u.id
    ${whereClause}
    ORDER BY 
      CASE 
        WHEN r.estado = 'pendiente' THEN 1
        WHEN r.estado = 'cancelada' THEN 2
        ELSE 3
      END,
      r.fecha_reserva DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  const reservas = await executeQuery(reservasQuery, [...queryParams, itemsPerPage, offset]).catch((error) => {
    console.error("Error fetching reservas:", error)
    return []
  })

  // Parámetros para estadísticas de usuarios
  const userStatsPage = activeTab === "user-statistics" ? currentPage : 1
  const userStatsOffset = (userStatsPage - 1) * itemsPerPage

  // Consulta para contar el total de usuarios con estadísticas
  const userStatsCountQuery = `
    SELECT COUNT(DISTINCT u.id) as total
    FROM usuarios u
    LEFT JOIN reservas r ON u.id = r.usuario_id
    GROUP BY u.id
    HAVING COUNT(*) > 0
  `

  const userStatsCountResult = await executeQuery(userStatsCountQuery)
  const totalUserStats = userStatsCountResult.length

  // Obtener estadísticas de reservas por usuario
  const estadisticasUsuariosQuery = `
    SELECT 
      u.id as usuario_id,
      u.nombre || ' ' || u.apellido as usuario_nombre,
      u.email as usuario_email,
      COUNT(CASE WHEN r.estado = 'pendiente' THEN 1 END) as reservas_activas,
      COUNT(CASE WHEN r.estado = 'cancelada' THEN 1 END) as reservas_canceladas,
      COUNT(*) as total_reservas
    FROM usuarios u
    LEFT JOIN reservas r ON u.id = r.usuario_id
    GROUP BY u.id, u.nombre, u.apellido, u.email
    HAVING COUNT(*) > 0
    ORDER BY reservas_activas DESC, total_reservas DESC
    LIMIT $1 OFFSET $2
  `

  const estadisticasUsuarios = await executeQuery(estadisticasUsuariosQuery, [itemsPerPage, userStatsOffset]).catch(
    (error) => {
      console.error("Error fetching user statistics:", error)
      return []
    },
  )

  // Calcular estadísticas generales
  const reservasActivas = reservas.filter((r: any) => r.estado === "pendiente").length
  const reservasCanceladas = reservas.filter((r: any) => r.estado === "cancelada").length
  const totalReservas = reservas.length

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  // Función para calcular tiempo restante
  const calcularTiempoRestante = (fechaReserva: string) => {
    const fechaInicio = new Date(fechaReserva)
    const fechaVencimiento = new Date(fechaInicio)
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 1) // 1 día después

    const ahora = new Date()
    const tiempoRestante = fechaVencimiento.getTime() - ahora.getTime()

    if (tiempoRestante <= 0) return "Vencida"

    const horasRestantes = Math.floor(tiempoRestante / (1000 * 60 * 60))
    const minutosRestantes = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60))

    return `${horasRestantes}h ${minutosRestantes}m`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAdminPage={true} />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar user={session.user} />
        <main id="contenido-principal" className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestión de Reservas</h1>
              <p className="text-muted-foreground">Administra las reservas de libros de los usuarios.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Reservas Activas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reservasActivas}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Reservas Canceladas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reservasCanceladas}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalReservas}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue={activeTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="active-reservations" asChild>
                  <Link
                    href={`/admin/reservas?tab=active-reservations${searchTerm ? `&search=${searchTerm}` : ""}${estadoFilter ? `&estado=${estadoFilter}` : ""}`}
                  >
                    Reservas Activas
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="user-statistics" asChild>
                  <Link
                    href={`/admin/reservas?tab=user-statistics${searchTerm ? `&search=${searchTerm}` : ""}${estadoFilter ? `&estado=${estadoFilter}` : ""}`}
                  >
                    Estadísticas por Usuario
                  </Link>
                </TabsTrigger>
              </TabsList>

              {/* Filtros de búsqueda */}
              <div className="mb-4">
                <form method="get" className="flex flex-col sm:flex-row gap-2">
                  <input type="hidden" name="tab" value={activeTab} />
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="search"
                      name="search"
                      placeholder="Buscar reservas..."
                      defaultValue={searchTerm}
                      className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  {activeTab === "active-reservations" && (
                    <select
                      name="estado"
                      defaultValue={estadoFilter}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Todos los estados</option>
                      <option value="pendiente">Pendientes</option>
                      <option value="cancelada">Canceladas</option>
                    </select>
                  )}
                  <Button type="submit" size="sm">
                    Filtrar
                  </Button>
                  {(searchTerm || estadoFilter) && (
                    <Link href={`/admin/reservas?tab=${activeTab}`}>
                      <Button variant="outline" size="sm">
                        Limpiar
                      </Button>
                    </Link>
                  )}
                </form>
              </div>

              <TabsContent value="active-reservations" className="space-y-4">
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Libro</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Usuario
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Fecha Reserva
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Tiempo Restante
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {reservas.length > 0 ? (
                          reservas.map((reserva: any) => (
                            <tr
                              key={reserva.id}
                              className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${
                                reserva.estado === "pendiente" ? "bg-blue-50" : "bg-gray-50"
                              }`}
                            >
                              <td className="p-4 align-middle">
                                <div className="flex items-center gap-3">
                                  {reserva.libro_imagen && (
                                    <img
                                      src={reserva.libro_imagen || "/placeholder.svg"}
                                      alt={reserva.libro_titulo}
                                      className="h-12 w-9 object-cover rounded"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium">{reserva.libro_titulo}</div>
                                    <div className="text-xs text-muted-foreground">{reserva.libro_autor}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 align-middle">
                                <div>
                                  <div>{reserva.usuario_nombre}</div>
                                  <div className="text-xs text-muted-foreground">{reserva.usuario_email}</div>
                                </div>
                              </td>
                              <td className="p-4 align-middle">{formatDate(reserva.fecha_reserva)}</td>
                              <td className="p-4 align-middle">
                                {reserva.estado === "pendiente" ? (
                                  <span className="font-medium">{calcularTiempoRestante(reserva.fecha_reserva)}</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="p-4 align-middle">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    reserva.estado === "pendiente"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {reserva.estado === "pendiente" ? "Activa" : "Cancelada"}
                                  {reserva.estado === "pendiente" && <AlertTriangle className="ml-1 h-3 w-3" />}
                                </span>
                              </td>
                              <td className="p-4 align-middle">
                                <div className="flex items-center gap-2">
                                  {reserva.estado === "pendiente" && (
                                    <>
                                      <Link href={`/admin/reservas/confirmar/${reserva.id}`}>
                                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                                          <CheckCircle className="h-3.5 w-3.5" />
                                          Confirmar Préstamo
                                        </Button>
                                      </Link>
                                      <Link href={`/admin/reservas/cancelar/${reserva.id}`}>
                                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                                          <XCircle className="h-3.5 w-3.5" />
                                          Cancelar
                                        </Button>
                                      </Link>
                                    </>
                                  )}
                                  <Link href={`/admin/reservas/${reserva.id}`}>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                      <Info className="h-3.5 w-3.5" />
                                      Detalles
                                    </Button>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="h-24 text-center">
                              {searchTerm || estadoFilter
                                ? "No se encontraron reservas que coincidan con los filtros."
                                : "No se encontraron reservas."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Paginación para reservas */}
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  baseUrl="/admin/reservas"
                  queryParams={{
                    tab: "active-reservations",
                    ...(searchTerm ? { search: searchTerm } : {}),
                    ...(estadoFilter ? { estado: estadoFilter } : {}),
                  }}
                />

                <div className="text-sm text-muted-foreground">
                  Mostrando {reservas.length} de {totalItems} reservas
                  {searchTerm && ` para la búsqueda "${searchTerm}"`}
                  {estadoFilter && ` con estado "${estadoFilter}"`}
                </div>
              </TabsContent>

              <TabsContent value="user-statistics" className="space-y-4">
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Usuario
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Reservas Activas
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Reservas Canceladas
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Total Reservas
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {estadisticasUsuarios.length > 0 ? (
                          estadisticasUsuarios.map((usuario: any) => (
                            <tr
                              key={usuario.usuario_id}
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                              <td className="p-4 align-middle">
                                <div>
                                  <div className="font-medium">{usuario.usuario_nombre}</div>
                                  <div className="text-xs text-muted-foreground">{usuario.usuario_email}</div>
                                </div>
                              </td>
                              <td className="p-4 align-middle">
                                <span className="font-medium text-blue-600">{usuario.reservas_activas}</span>
                              </td>
                              <td className="p-4 align-middle">
                                <span className="font-medium text-gray-600">{usuario.reservas_canceladas}</span>
                              </td>
                              <td className="p-4 align-middle">
                                <span className="font-medium">{usuario.total_reservas}</span>
                              </td>
                              <td className="p-4 align-middle">
                                <Link href={`/admin/users/edit/${usuario.usuario_id}`}>
                                  <Button variant="outline" size="sm">
                                    Ver Usuario
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="h-24 text-center">
                              No hay datos de reservas por usuario.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Paginación para estadísticas de usuarios */}
                <Pagination
                  totalItems={totalUserStats}
                  itemsPerPage={itemsPerPage}
                  currentPage={userStatsPage}
                  baseUrl="/admin/reservas"
                  queryParams={{
                    tab: "user-statistics",
                    ...(searchTerm ? { search: searchTerm } : {}),
                  }}
                />

                <div className="text-sm text-muted-foreground">
                  Mostrando {estadisticasUsuarios.length} de {totalUserStats} usuarios con reservas
                  {searchTerm && ` para la búsqueda "${searchTerm}"`}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
