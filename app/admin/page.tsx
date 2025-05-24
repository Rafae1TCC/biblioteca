export const dynamic = "force-dynamic"
import Link from "next/link"
import { BookOpen, Users, ClipboardList, BarChart, Settings, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { requireAdmin } from "@/lib/mock-auth"
import { executeQuery } from "@/lib/db"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

async function getDashboardData() {
  try {
    // Obtener estadísticas generales
    const totalLibros = await executeQuery("SELECT COUNT(*) as total FROM libros")
    const usuariosActivos = await executeQuery("SELECT COUNT(*) as total FROM usuarios WHERE estado = 'activo'")
    const prestamosActivos = await executeQuery("SELECT COUNT(*) as total FROM prestamos WHERE estado = 'activo'")
    const prestamosVencidos = await executeQuery("SELECT COUNT(*) as total FROM prestamos WHERE estado = 'vencido'")

    // Obtener actividad reciente
    const actividadReciente = await executeQuery(`
      SELECT 'nuevo_libro' as tipo, l.titulo as titulo, u.nombre || ' ' || u.apellido as usuario, l.fecha_creacion as fecha
      FROM libros l
      JOIN usuarios u ON u.rol = 'administrador'
      ORDER BY l.fecha_creacion DESC
      LIMIT 2
      
      UNION ALL
      
      SELECT 'nuevo_usuario' as tipo, u.nombre || ' ' || u.apellido as titulo, '' as usuario, u.fecha_registro as fecha
      FROM usuarios u
      WHERE u.rol = 'usuario'
      ORDER BY u.fecha_registro DESC
      LIMIT 2
      
      UNION ALL
      
      SELECT 'prestamo' as tipo, l.titulo as titulo, u.nombre || ' ' || u.apellido as usuario, p.fecha_prestamo as fecha
      FROM prestamos p
      JOIN libros l ON p.libro_id = l.id
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.fecha_prestamo DESC
      LIMIT 2
      
      UNION ALL
      
      SELECT 'devolucion' as tipo, l.titulo as titulo, u.nombre || ' ' || u.apellido as usuario, p.fecha_devolucion as fecha
      FROM prestamos p
      JOIN libros l ON p.libro_id = l.id
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.estado = 'devuelto'
      ORDER BY p.fecha_devolucion DESC
      LIMIT 2
      
      ORDER BY fecha DESC
      LIMIT 4
    `)

    // Obtener préstamos recientes
    const prestamosRecientes = await executeQuery(`
      SELECT p.*, l.titulo, u.nombre || ' ' || u.apellido as usuario
      FROM prestamos p
      JOIN libros l ON p.libro_id = l.id
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.estado = 'activo'
      ORDER BY p.fecha_prestamo DESC
      LIMIT 4
    `)

    // Obtener devoluciones recientes
    const devolucionesRecientes = await executeQuery(`
      SELECT p.*, l.titulo, u.nombre || ' ' || u.apellido as usuario
      FROM prestamos p
      JOIN libros l ON p.libro_id = l.id
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.estado = 'devuelto'
      ORDER BY p.fecha_devolucion DESC
      LIMIT 4
    `)

    return {
      totalLibros: totalLibros[0].total,
      usuariosActivos: usuariosActivos[0].total,
      prestamosActivos: prestamosActivos[0].total,
      prestamosVencidos: prestamosVencidos[0].total,
      actividadReciente,
      prestamosRecientes,
      devolucionesRecientes,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    // Return mock data for demonstration
    return {
      totalLibros: 120,
      usuariosActivos: 45,
      prestamosActivos: 32,
      prestamosVencidos: 5,
      actividadReciente: [
        {
          tipo: "nuevo_libro",
          titulo: "El Gran Gatsby",
          usuario: "Admin Usuario",
          fecha: new Date().toISOString(),
        },
        {
          tipo: "nuevo_usuario",
          titulo: "Juan Pérez",
          usuario: "",
          fecha: new Date().toISOString(),
        },
      ],
      prestamosRecientes: [
        {
          id: 1,
          titulo: "1984",
          usuario: "Juan Pérez",
          fecha_vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      devolucionesRecientes: [
        {
          id: 2,
          titulo: "Matar a un Ruiseñor",
          usuario: "María García",
          fecha_devolucion: new Date().toISOString(),
        },
      ],
    }
  }
}

export default async function AdminDashboard() {
  const user = await requireAdmin("/iniciar-sesion?callbackUrl=/admin")

  const dashboardData = await getDashboardData()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="md:w-64 bg-muted/30 border-r border-border/50">
          <div className="p-4 border-b border-border/50 flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user.image || ""} alt={user.name || "Admin"} />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <nav className="p-4">
            <div className="space-y-1">
              <Link href="/admin">
                <Button variant="secondary" className="w-full justify-start" size="sm">
                  <BarChart className="mr-2 h-4 w-4" />
                  Resumen
                </Button>
              </Link>
              <Link href="/admin/books">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Libros
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Usuarios
                </Button>
              </Link>
              <Link href="/admin/loans">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Préstamos
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Button>
              </Link>
              <form action="/api/auth/signout" method="post">
                <Button variant="ghost" className="w-full justify-start" size="sm" type="submit">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </form>
            </div>
          </nav>
        </aside>
        <main id="contenido-principal" className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
              <p className="text-muted-foreground">Gestiona los recursos y usuarios de tu biblioteca.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-card border border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Libros</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.totalLibros}</div>
                  <p className="text-xs text-muted-foreground">+12 añadidos este mes</p>
                </CardContent>
              </Card>
              <Card className="bg-card border border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.usuariosActivos}</div>
                  <p className="text-xs text-muted-foreground">+42 desde el mes pasado</p>
                </CardContent>
              </Card>
              <Card className="bg-card border border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.prestamosActivos}</div>
                  <p className="text-xs text-muted-foreground">+18% desde el mes pasado</p>
                </CardContent>
              </Card>
              <Card className="bg-card border border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Devoluciones Vencidas</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.prestamosVencidos}</div>
                  <p className="text-xs text-muted-foreground">-4 desde la semana pasada</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="recent-activity" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="recent-activity">Actividad Reciente</TabsTrigger>
                <TabsTrigger value="recent-loans">Préstamos Recientes</TabsTrigger>
                <TabsTrigger value="recent-returns">Devoluciones Recientes</TabsTrigger>
              </TabsList>
              <TabsContent value="recent-activity" className="space-y-4">
                <Card className="bg-card border border-border/50">
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>Resumen de acciones recientes en el sistema de biblioteca.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.actividadReciente.map((actividad: any, index: number) => {
                        let icon
                        let description

                        switch (actividad.tipo) {
                          case "nuevo_libro":
                            icon = <BookOpen className="h-4 w-4 text-primary" />
                            description = `Nuevo libro añadido: "${actividad.titulo}"`
                            break
                          case "nuevo_usuario":
                            icon = <Users className="h-4 w-4 text-primary" />
                            description = `Nuevo usuario registrado: ${actividad.titulo}`
                            break
                          case "prestamo":
                            icon = <ClipboardList className="h-4 w-4 text-primary" />
                            description = `Libro prestado: "${actividad.titulo}" a ${actividad.usuario}`
                            break
                          case "devolucion":
                            icon = <ClipboardList className="h-4 w-4 text-primary" />
                            description = `Libro devuelto: "${actividad.titulo}" por ${actividad.usuario}`
                            break
                          default:
                            icon = <BookOpen className="h-4 w-4 text-primary" />
                            description = `Actividad: ${actividad.titulo}`
                        }

                        return (
                          <div key={index} className="flex items-center">
                            <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                              {icon}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">{description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(actividad.fecha).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="recent-loans" className="space-y-4">
                <Card className="bg-card border border-border/50">
                  <CardHeader>
                    <CardTitle>Préstamos Recientes</CardTitle>
                    <CardDescription>Libros que han sido prestados recientemente.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 text-sm font-medium">
                        <div>Libro</div>
                        <div>Usuario</div>
                        <div>Fecha de Vencimiento</div>
                      </div>
                      {dashboardData.prestamosRecientes.map((prestamo: any) => (
                        <div key={prestamo.id} className="grid grid-cols-3 items-center text-sm">
                          <div>{prestamo.titulo}</div>
                          <div>{prestamo.usuario}</div>
                          <div>{new Date(prestamo.fecha_vencimiento).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="recent-returns" className="space-y-4">
                <Card className="bg-card border border-border/50">
                  <CardHeader>
                    <CardTitle>Devoluciones Recientes</CardTitle>
                    <CardDescription>Libros que han sido devueltos recientemente.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 text-sm font-medium">
                        <div>Libro</div>
                        <div>Usuario</div>
                        <div>Fecha de Devolución</div>
                      </div>
                      {dashboardData.devolucionesRecientes.map((devolucion: any) => (
                        <div key={devolucion.id} className="grid grid-cols-3 items-center text-sm">
                          <div>{devolucion.titulo}</div>
                          <div>{devolucion.usuario}</div>
                          <div>{new Date(devolucion.fecha_devolucion).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
