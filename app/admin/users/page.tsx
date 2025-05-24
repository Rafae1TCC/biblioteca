export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { executeQuery } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, UserX, UserCheck, Search } from "lucide-react"
import Link from "next/link"
import { Pagination } from "@/components/ui/pagination"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; estado?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "administrador") {
    redirect("/login?callbackUrl=/admin/users")
  }

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
      `(u.nombre ILIKE $${paramIndex} OR u.apellido ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`,
    )
    queryParams.push(`%${searchTerm}%`)
    paramIndex++
  }

  if (estadoFilter) {
    whereConditions.push(`u.estado = $${paramIndex}`)
    queryParams.push(estadoFilter)
    paramIndex++
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

  // Consulta para contar el total de usuarios
  const countQuery = `
    SELECT COUNT(*) as total
    FROM usuarios u
    ${whereClause}
  `

  const countResult = await executeQuery(countQuery, queryParams)
  const totalItems = Number.parseInt(countResult[0].total)

  // Consulta para obtener usuarios con paginación
  const usersQuery = `
    SELECT u.*, 
           COUNT(p.id) as prestamos_activos
    FROM usuarios u
    LEFT JOIN prestamos p ON u.id = p.usuario_id AND p.estado = 'activo'
    ${whereClause}
    GROUP BY u.id
    ORDER BY u.nombre ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  const users = await executeQuery(usersQuery, [...queryParams, itemsPerPage, offset]).catch((error) => {
    console.error("Error fetching users:", error)
    return []
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAdminPage={true} />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar user={session.user} />
        <main id="contenido-principal" className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">Administra los usuarios de la biblioteca.</p>
              </div>
              <Link href="/admin/users/new">
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Añadir Usuario
                </Button>
              </Link>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <form method="get" className="flex gap-2">
                  <input
                    type="search"
                    name="search"
                    placeholder="Buscar por nombre o email..."
                    defaultValue={searchTerm}
                    className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <select
                    name="estado"
                    defaultValue={estadoFilter}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                    <option value="pendiente">Pendientes</option>
                  </select>
                  <Button type="submit" size="sm">
                    Filtrar
                  </Button>
                  {(searchTerm || estadoFilter) && (
                    <Link href="/admin/users">
                      <Button variant="outline" size="sm">
                        Limpiar
                      </Button>
                    </Link>
                  )}
                </form>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nombre</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rol</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Préstamos</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {users.length > 0 ? (
                      users.map((user: any) => (
                        <tr
                          key={user.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">
                            {user.nombre} {user.apellido}
                          </td>
                          <td className="p-4 align-middle">{user.email}</td>
                          <td className="p-4 align-middle">{user.rol || "usuario"}</td>
                          <td className="p-4 align-middle">{user.prestamos_activos || 0}</td>
                          <td className="p-4 align-middle">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.estado === "activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.estado === "activo" ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/users/edit/${user.id}`}>
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                  <Edit className="h-3.5 w-3.5" />
                                  Editar
                                </Button>
                              </Link>
                              <Link href={`/admin/users/toggle-status/${user.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`flex items-center gap-1 ${
                                    user.estado === "activo" ? "text-red-500" : "text-green-500"
                                  }`}
                                >
                                  {user.estado === "activo" ? (
                                    <>
                                      <UserX className="h-3.5 w-3.5" />
                                      Desactivar
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-3.5 w-3.5" />
                                      Activar
                                    </>
                                  )}
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="h-24 text-center">
                          No se encontraron usuarios.
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
              baseUrl="/admin/users"
              queryParams={{
                ...(searchTerm ? { search: searchTerm } : {}),
                ...(estadoFilter ? { estado: estadoFilter } : {}),
              }}
            />

            <div className="text-sm text-muted-foreground">
              Mostrando {users.length} de {totalItems} usuarios
              {searchTerm && ` para la búsqueda "${searchTerm}"`}
              {estadoFilter && ` con estado "${estadoFilter}"`}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
