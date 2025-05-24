import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { bookId } = await request.json()
    if (!bookId) {
      return NextResponse.json({ error: "ID del libro requerido" }, { status: 400 })
    }

    // Obtener el ID del usuario de la base de datos
    const users = await executeQuery(`SELECT id FROM usuarios WHERE email = $1`, [session.user.email])

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userId = users[0].id

    // Verificar si el libro está disponible
    const books = await executeQuery(`SELECT copias_disponibles FROM libros WHERE id = $1`, [bookId])

    if (!books || books.length === 0) {
      return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 })
    }

    if (books[0].copias_disponibles <= 0) {
      return NextResponse.json({ error: "No hay copias disponibles" }, { status: 400 })
    }

    // Verificar si el usuario ya tiene una reserva activa para este libro
    const activeReservations = await executeQuery(
      `SELECT * FROM prestamos 
       WHERE usuario_id = $1 AND libro_id = $2 
       AND estado = 'activo' AND notas = 'RESERVA'`,
      [userId, bookId],
    )

    if (activeReservations && activeReservations.length > 0) {
      return NextResponse.json({ error: "Ya tienes una reserva activa para este libro" }, { status: 400 })
    }

    // Verificar si el usuario ya tiene un préstamo activo para este libro
    const activeLoans = await executeQuery(
      `SELECT * FROM prestamos 
       WHERE usuario_id = $1 AND libro_id = $2 
       AND estado = 'activo' AND (notas IS NULL OR notas != 'RESERVA')`,
      [userId, bookId],
    )

    if (activeLoans && activeLoans.length > 0) {
      return NextResponse.json({ error: "Ya tienes un préstamo activo para este libro" }, { status: 400 })
    }

    // Crear una reserva (que es un préstamo con notas = 'RESERVA')
    // Las reservas duran solo un día
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Iniciar una transacción
    await executeQuery("BEGIN")

    try {
      // Insertar la reserva como un préstamo
      const result = await executeQuery(
        `INSERT INTO prestamos 
         (usuario_id, libro_id, fecha_prestamo, fecha_vencimiento, estado, notas) 
         VALUES ($1, $2, NOW(), $3, 'activo', 'RESERVA')
         RETURNING id`,
        [userId, bookId, tomorrow.toISOString()],
      )

      // Actualizar el número de copias disponibles
      await executeQuery(
        `UPDATE libros 
         SET copias_disponibles = copias_disponibles - 1 
         WHERE id = $1 AND copias_disponibles > 0`,
        [bookId],
      )

      // Confirmar la transacción
      await executeQuery("COMMIT")

      return NextResponse.json({
        message: "Libro reservado correctamente",
        reservationId: result[0].id,
        expiresAt: tomorrow.toISOString(),
      })
    } catch (error) {
      // Revertir la transacción en caso de error
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error al crear la reserva:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
