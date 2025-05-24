import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookCover } from "@/components/book-cover"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Clock, ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic" // Asegura que la página siempre se renderice en el servidor

async function getUserLoans(userId: number, filter?: string) {
  try {
    let query = `
      SELECT p.*, 
             l.titulo, 
             l.autor, 
             l.imagen_portada, 
             l.portada_url
      FROM prestamos p
      JOIN libros l ON p.libro_id = l.id
      WHERE p.usuario_id = $1
    `

    const params = [userId]

    // Aplicar filtros si se especifican
    if (filter === "activos") {
      query += " AND p.estado = 'activo'"
    } else if (filter === "vencidos") {
      query += " AND ((p.estado = 'activo' AND p.fecha_vencimiento < CURRENT_DATE) OR p.estado = 'vencido')"
    } else if (filter === "devueltos") {
      query += " AND p.estado = 'devuelto'"
    }

    // Ordenar por estado y fecha
    query += `
      ORDER BY 
        CASE 
          WHEN p.estado = 'vencido' OR (p.estado = 'activo' AND p.fecha_vencimiento < CURRENT_DATE) THEN 0 
          WHEN p.estado = 'activo' THEN 1 
          ELSE 2 
        END,
        p.fecha_vencimiento ASC
    `

    return await executeQuery(query, params)
  } catch (error) {
    console.error("Error al obtener préstamos del usuario:", error)
    return []
  }
}

// Función para determinar el estado real del préstamo
function getLoanStatus(loan: any) {
  if (loan.estado === "devuelto") {
    return "devuelto"
  }

  if (loan.estado === "vencido") {
    return "vencido"
  }

  // Convertir fechas a objetos Date para comparación
  const fechaVencimiento = new Date(loan.fecha_vencimiento)
  const hoy = new Date()

  // Normalizar las fechas para comparar solo año, mes y día
  fechaVencimiento.setHours(0, 0, 0, 0)
  hoy.setHours(0, 0, 0, 0)

  if (fechaVencimiento < hoy) {
    return "vencido"
  }

  return "activo"
}

export default async function UserLoansPage({ searchParams }: { searchParams: { filter?: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/usuario/prestamos")
  }

  // Obtener el ID del usuario
  const userResult = await executeQuery("SELECT id FROM usuarios WHERE email = $1", [session.user.email])

  if (userResult.length === 0) {
    redirect("/auth/verify-user")
  }

  const userId = userResult[0].id

  // Determinar el filtro activo
  const filter = searchParams.filter || "todos"

  // Obtener préstamos según el filtro
  const loans = await getUserLoans(userId, filter)

  // Actualizar automáticamente el estado de los préstamos vencidos
  for (const loan of loans) {
    const realStatus = getLoanStatus(loan)
    if (loan.estado === "activo" && realStatus === "vencido") {
      try {
        await executeQuery("UPDATE prestamos SET estado = 'vencido' WHERE id = $1", [loan.id])
        loan.estado = "vencido"
      } catch (error) {
        console.error("Error al actualizar estado de préstamo vencido:", error)
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mis Préstamos</h1>
          <p className="text-muted-foreground">Gestiona tus préstamos de libros.</p>
        </div>

        <Button asChild variant="outline" className="mb-6">
          <Link href="/usuario/dashboard" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Link>
        </Button>

        <Tabs defaultValue={filter} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="todos" asChild>
              <Link href="/usuario/prestamos">Todos</Link>
            </TabsTrigger>
            <TabsTrigger value="activos" asChild>
              <Link href="/usuario/prestamos?filter=activos">Activos</Link>
            </TabsTrigger>
            <TabsTrigger value="vencidos" asChild>
              <Link href="/usuario/prestamos?filter=vencidos">Vencidos</Link>
            </TabsTrigger>
            <TabsTrigger value="devueltos" asChild>
              <Link href="/usuario/prestamos?filter=devueltos">Devueltos</Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-0">
            {loans.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {loans.map((loan) => {
                  const realStatus = getLoanStatus(loan)

                  return (
                    <Card
                      key={loan.id}
                      className={`
                        ${realStatus === "vencido" ? "bg-red-50" : ""} 
                        ${realStatus === "devuelto" ? "bg-gray-50" : ""}
                      `}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-24 flex-shrink-0">
                            <BookCover
                              imageUrl={loan.portada_url || loan.imagen_portada}
                              title={loan.titulo}
                              className="w-full h-full"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{loan.titulo}</h3>
                            <p className="text-muted-foreground">{loan.autor}</p>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                              <div>
                                <p className="text-sm text-muted-foreground">Fecha de préstamo:</p>
                                <p className="text-sm">
                                  {format(new Date(loan.fecha_prestamo), "PPP", { locale: es })}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm text-muted-foreground">Fecha de vencimiento:</p>
                                <p className="text-sm">
                                  {format(new Date(loan.fecha_vencimiento), "PPP", { locale: es })}
                                </p>
                              </div>

                              {loan.fecha_devolucion && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Fecha de devolución:</p>
                                  <p className="text-sm">
                                    {format(new Date(loan.fecha_devolucion), "PPP", { locale: es })}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center mt-3">
                              {realStatus === "activo" && (
                                <div className="flex items-center text-green-600">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span className="text-sm font-medium">Activo</span>
                                </div>
                              )}

                              {realStatus === "vencido" && (
                                <div className="flex items-center text-red-600">
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  <span className="text-sm font-medium">Vencido</span>
                                </div>
                              )}

                              {realStatus === "devuelto" && (
                                <div className="flex items-center text-gray-600">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  <span className="text-sm font-medium">Devuelto</span>
                                </div>
                              )}
                            </div>

                            {loan.notas && (
                              <div className="mt-2 p-2 bg-gray-100 rounded-md">
                                <p className="text-sm font-medium">Notas:</p>
                                <p className="text-sm">{loan.notas}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  No tienes préstamos {filter !== "todos" ? `${filter}` : ""}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {filter === "todos" && "Aún no has realizado ningún préstamo de libros."}
                  {filter === "activos" && "No tienes préstamos activos en este momento."}
                  {filter === "vencidos" && "¡Genial! No tienes préstamos vencidos."}
                  {filter === "devueltos" && "No has devuelto ningún libro todavía."}
                </p>
                <Button asChild>
                  <Link href="/catalogo">Explorar Catálogo</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
