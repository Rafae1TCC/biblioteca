export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { executeQuery } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PlusCircle, CheckCircle, Info, Edit, AlertTriangle, Search, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { Pagination } from "@/components/ui/pagination"

// Componente para mostrar un estado de carga
function LoadingState() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-lg">Cargando préstamos...</span>
    </div>
  )
}

// Componente para mostrar la tabla de préstamos
async function LoansTable({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; estado?: string }
}) {
  console.log("[AdminLoansPage:LoansTable] Iniciando carga de préstamos")

  // Parámetros de paginación y filtrado
  const currentPage = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const itemsPerPage = 10
  const offset = (currentPage - 1) * itemsPerPage
  const searchTerm = searchParams.search || ""
  const estadoFilter = searchParams.estado || ""

  // Construir condiciones de filtrado
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
    whereConditions.push(`p.estado = $${paramIndex}`)
    queryParams.push(estadoFilter)
    paramIndex++
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

  // Consulta para contar el total de préstamos
  const countQuery = `
    SELECT COUNT(*) as total
    FROM prestamos p
    JOIN libros l ON p.libro_id = l.id
    JOIN usuarios u ON p.usuario_id = u.id
    ${whereClause}
  `

  const countResult = await executeQuery(countQuery, queryParams)
  const totalItems = Number.parseInt(countResult[0].total)

  // Consulta para obtener préstamos con paginación
  const loansQuery = `
    SELECT p.*, 
           l.titulo as libro_titulo, 
           u.nombre || ' ' || u.apellido as usuario_nombre,
           u.email as usuario_email
    FROM prestamos p
    JOIN libros l ON p.libro_id = l.id
    JOIN usuarios u ON p.usuario_id = u.id
    ${whereClause}
    ORDER BY 
      CASE 
        WHEN p.estado = 'vencido' THEN 1
        WHEN p.estado = 'activo' AND p.notas = 'RESERVA' THEN 2
        WHEN p.estado = 'activo' THEN 3
        ELSE 4
      END,
      p.fecha_prestamo DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  const loans = await executeQuery(loansQuery, [...queryParams, itemsPerPage, offset]).catch((error) => {
    console.error("[AdminLoansPage:LoansTable] Error al cargar préstamos:", error)
    return []
  })

  console.log(`[AdminLoansPage:LoansTable] ${loans.length} préstamos cargados`)

  // Get current date for comparison
  const currentDate = new Date()

  // Update status of overdue loans
  for (const loan of loans) {
    if (loan.estado === "activo" && new Date(loan.fecha_vencimiento) < currentDate) {
      console.log(`[AdminLoansPage:LoansTable] Préstamo ${loan.id} vencido, actualizando estado`)

      // Update loan status to 'vencido' in the database
      await executeQuery(
        `
        UPDATE prestamos 
        SET estado = 'vencido' 
        WHERE id = $1 AND estado = 'activo'
      `,
        [loan.id],
      ).catch((error) => {
        console.error(`[AdminLoansPage:LoansTable] Error al actualizar estado del préstamo ${loan.id}:`, error)
      })

      // Update the status in the current data
      loan.estado = "vencido"
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Libro</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Usuario</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha Préstamo</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Fecha Vencimiento
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loans.length > 0 ? (
                loans.map((loan: any) => (
                  <tr
                    key={loan.id}
                    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${
                      loan.estado === "vencido" ? "bg-red-50" : loan.notas === "RESERVA" ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="p-4 align-middle">{loan.libro_titulo}</td>
                    <td className="p-4 align-middle">
                      <div>
                        <div>{loan.usuario_nombre}</div>
                        <div className="text-xs text-muted-foreground">{loan.usuario_email}</div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{new Date(loan.fecha_prestamo).toLocaleDateString()}</td>
                    <td className="p-4 align-middle">{new Date(loan.fecha_vencimiento).toLocaleDateString()}</td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          loan.estado === "activo" && loan.notas === "RESERVA"
                            ? "bg-yellow-100 text-yellow-800"
                            : loan.estado === "activo"
                              ? "bg-blue-100 text-blue-800"
                              : loan.estado === "vencido"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                        }`}
                      >
                        {loan.estado === "activo" && loan.notas === "RESERVA"
                          ? "RESERVA"
                          : loan.estado === "activo"
                            ? "Activo"
                            : loan.estado === "vencido"
                              ? "Vencido"
                              : "Devuelto"}
                        {loan.notas === "RESERVA" && <AlertTriangle className="ml-1 h-3 w-3" />}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        {loan.estado !== "devuelto" && (
                          <>
                            <Link href={`/admin/loans/return/${loan.id}`}>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" />
                                {loan.notas === "RESERVA" ? "Confirmar Préstamo" : "Devolver"}
                              </Button>
                            </Link>
                            <Link href={`/admin/loans/edit/${loan.id}`}>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <Edit className="h-3.5 w-3.5" />
                                Editar
                              </Button>
                            </Link>
                          </>
                        )}
                        <Link href={`/admin/loans/${loan.id}`}>
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
                      ? "No se encontraron préstamos que coincidan con los filtros."
                      : "No se encontraron préstamos."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        baseUrl="/admin/loans"
        queryParams={{
          ...(searchTerm ? { search: searchTerm } : {}),
          ...(estadoFilter ? { estado: estadoFilter } : {}),
        }}
      />

      <div className="text-sm text-muted-foreground">
        Mostrando {loans.length} de {totalItems} préstamos
        {searchTerm && ` para la búsqueda "${searchTerm}"`}
        {estadoFilter && ` con estado "${estadoFilter}"`}
      </div>
    </>
  )
}

export default async function AdminLoansPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; estado?: string }
}) {
  console.log("[AdminLoansPage] Iniciando renderizado de página")

  const session = await getServerSession(authOptions)
  console.log("[AdminLoansPage] Sesión:", session ? "Autenticado" : "No autenticado")

  if (!session || session.user.role !== "administrador") {
    console.log("[AdminLoansPage] Redirigiendo: Usuario no es administrador")
    redirect("/login?callbackUrl=/admin/loans")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAdminPage={true} />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar user={session.user} />
        <main id="contenido-principal" className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Préstamos</h1>
                <p className="text-muted-foreground">Administra los préstamos y reservas de la biblioteca.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/admin/loans/new">
                  <Button className="flex items-center gap-2 w-full sm:w-auto">
                    <PlusCircle className="h-4 w-4" />
                    Registrar Préstamo
                  </Button>
                </Link>
                <Link href="/admin/loans" className="w-full sm:w-auto">
                  <Button variant="outline" className="flex items-center gap-2 w-full">
                    <RefreshCw className="h-4 w-4" />
                    Actualizar
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="w-full sm:w-auto flex-1">
                  <form method="get" className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="search"
                        name="search"
                        placeholder="Buscar préstamos..."
                        defaultValue={searchParams.search || ""}
                        className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                    <select
                      name="estado"
                      defaultValue={searchParams.estado || ""}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Todos los estados</option>
                      <option value="activo">Activos</option>
                      <option value="vencido">Vencidos</option>
                      <option value="devuelto">Devueltos</option>
                    </select>
                    <Button type="submit" size="sm">
                      Filtrar
                    </Button>
                    {(searchParams.search || searchParams.estado) && (
                      <Link href="/admin/loans">
                        <Button variant="outline" size="sm">
                          Limpiar
                        </Button>
                      </Link>
                    )}
                  </form>
                </div>
              </div>
            </div>

            <Suspense fallback={<LoadingState />}>
              <LoansTable searchParams={searchParams} />
            </Suspense>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
