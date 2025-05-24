import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

// Modificar la función POST para incluir logging detallado

export async function POST(request: NextRequest) {
  console.log(`[API:reservas:POST] Iniciando procesamiento de solicitud de reserva`)
  try {
    const session = await getServerSession(authOptions)
    console.log(`[API:reservas:POST] Sesión de usuario verificada: ${session?.user?.email || "No autenticado"}`)

    if (!session?.user) {
      console.warn(`[API:reservas:POST] Intento de reserva sin autenticación`)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { libroId } = await request.json()
    console.log(`[API:reservas:POST] Datos recibidos: libroId=${libroId}`)

    if (!libroId) {
      console.warn(`[API:reservas:POST] Solicitud sin ID de libro`)
      return NextResponse.json({ error: "ID del libro requerido" }, { status: 400 })
    }

    console.log(`[API:reservas:POST] Creando reserva para el libro ${libroId} por ${session.user.email}`)

    // Obtener el ID del usuario
    console.log(`[API:reservas:POST] Consultando ID de usuario para email: ${session.user.email}`)
    const userResult = await executeQuery("SELECT id FROM usuarios WHERE email = $1", [session.user.email])

    if (userResult.length === 0) {
      console.error(`[API:reservas:POST] Usuario no encontrado para ${session.user.email}`)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userId = userResult[0].id
    console.log(`[API:reservas:POST] ID de usuario encontrado: ${userId}`)

    // Verificar si el libro existe y está disponible
    console.log(`[API:reservas:POST] Verificando existencia y disponibilidad del libro ID: ${libroId}`)
    const bookResult = await executeQuery("SELECT * FROM libros WHERE id = $1", [libroId])

    if (bookResult.length === 0) {
      console.error(`[API:reservas:POST] Libro ${libroId} no encontrado en la base de datos`)
      return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 })
    }

    if (bookResult[0].copias_disponibles <= 0) {
      console.warn(`[API:reservas:POST] Libro ${libroId} no tiene copias disponibles`)
      return NextResponse.json({ error: "Libro no disponible" }, { status: 400 })
    }

    console.log(`[API:reservas:POST] Libro ${libroId} disponible con ${bookResult[0].copias_disponibles} copias`)

    // Verificar si ya tiene una reserva activa para este libro
    console.log(`[API:reservas:POST] Verificando reservas existentes para usuario ${userId} y libro ${libroId}`)
    const existingReservation = await executeQuery(
      "SELECT * FROM reservas WHERE usuario_id = $1 AND libro_id = $2 AND estado = 'pendiente'",
      [userId, libroId],
    )

    if (existingReservation.length > 0) {
      console.warn(`[API:reservas:POST] El usuario ${userId} ya tiene una reserva activa para el libro ${libroId}`)
      return NextResponse.json({ error: "Ya tienes una reserva activa para este libro" }, { status: 400 })
    }

    // Iniciar transacción
    console.log(`[API:reservas:POST] Iniciando transacción de base de datos`)
    await executeQuery("BEGIN")

    try {
      // Crear la reserva con fecha de vencimiento (1 día después)
      const fechaVencimiento = new Date()
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 1)
      console.log(`[API:reservas:POST] Fecha de vencimiento calculada: ${fechaVencimiento.toISOString()}`)

      console.log(`[API:reservas:POST] Insertando registro de reserva en la base de datos`)
      await executeQuery(
        "INSERT INTO reservas (usuario_id, libro_id, estado, fecha_reserva, fecha_vencimiento) VALUES ($1, $2, 'pendiente', NOW(), $3)",
        [userId, libroId, fechaVencimiento],
      )
      console.log(`[API:reservas:POST] Reserva creada para el usuario ${userId} y libro ${libroId}`)

      // Actualizar disponibilidad del libro
      console.log(`[API:reservas:POST] Actualizando disponibilidad del libro ${libroId}`)
      await executeQuery("UPDATE libros SET copias_disponibles = copias_disponibles - 1 WHERE id = $1", [libroId])
      console.log(`[API:reservas:POST] Disponibilidad del libro ${libroId} actualizada`)

      // Confirmar transacción
      console.log(`[API:reservas:POST] Confirmando transacción`)
      await executeQuery("COMMIT")
      console.log(`[API:reservas:POST] Transacción completada con éxito`)

      return NextResponse.json({
        success: true,
        message: "Libro reservado con éxito. La reserva durará 1 día.",
      })
    } catch (error) {
      // Revertir transacción en caso de error
      console.error(`[API:reservas:POST] Error en la transacción, revirtiendo:`, error)
      await executeQuery("ROLLBACK")
      console.log(`[API:reservas:POST] Transacción revertida`)
      throw error
    }
  } catch (error) {
    console.error(`[API:reservas:POST] Error al crear la reserva:`, error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

// Modificar la función GET para incluir logging detallado

export async function GET(request: NextRequest) {
  console.log(`[API:reservas:GET] Iniciando obtención de reservas`)
  try {
    const session = await getServerSession(authOptions)
    console.log(`[API:reservas:GET] Sesión de usuario verificada: ${session?.user?.email || "No autenticado"}`)

    if (!session?.user) {
      console.warn(`[API:reservas:GET] Intento de acceso sin autenticación`)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el ID del usuario
    console.log(`[API:reservas:GET] Consultando ID y rol de usuario para email: ${session.user.email}`)
    const userResult = await executeQuery("SELECT id, rol FROM usuarios WHERE email = $1", [session.user.email])

    if (userResult.length === 0) {
      console.error(`[API:reservas:GET] Usuario no encontrado para ${session.user.email}`)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userId = userResult[0].id
    const userRole = userResult[0].rol
    console.log(`[API:reservas:GET] Usuario encontrado - ID: ${userId}, Rol: ${userRole}`)

    let reservas
    let query

    // Si es administrador, obtener todas las reservas
    if (userRole === "administrador") {
      console.log(`[API:reservas:GET] Usuario es administrador, obteniendo todas las reservas`)
      query = `SELECT r.*, l.titulo, l.autor, l.imagen_portada, u.nombre, u.apellido, u.email
         FROM reservas r
         JOIN libros l ON r.libro_id = l.id
         JOIN usuarios u ON r.usuario_id = u.id
         ORDER BY r.fecha_reserva DESC`
      reservas = await executeQuery(query)
      console.log(`[API:reservas:GET] Obtenidas ${reservas.length} reservas para el administrador`)
    } else {
      // Si es usuario normal, obtener solo sus reservas
      console.log(`[API:reservas:GET] Usuario regular, obteniendo solo sus reservas`)
      query = `SELECT r.*, l.titulo, l.autor, l.imagen_portada
         FROM reservas r
         JOIN libros l ON r.libro_id = l.id
         WHERE r.usuario_id = $1
         ORDER BY r.fecha_reserva DESC`
      reservas = await executeQuery(query, [userId])
      console.log(`[API:reservas:GET] Obtenidas ${reservas.length} reservas para el usuario ${userId}`)
    }

    console.log(`[API:reservas:GET] Retornando datos de reservas`)
    return NextResponse.json({ reservas })
  } catch (error) {
    console.error(`[API:reservas:GET] Error al obtener reservas:`, error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
