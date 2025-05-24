import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { reservaId, motivo } = await request.json()

    if (!reservaId) {
      return NextResponse.json({ error: "ID de reserva requerido" }, { status: 400 })
    }

    // Obtener información de la reserva
    const reservaResult = await executeQuery("SELECT * FROM reservas WHERE id = $1 AND estado = 'pendiente'", [
      reservaId,
    ])

    if (reservaResult.length === 0) {
      return NextResponse.json({ error: "Reserva no encontrada o no está activa" }, { status: 404 })
    }

    const reserva = reservaResult[0]

    // Iniciar transacción
    await executeQuery("BEGIN")

    try {
      // Actualizar estado de la reserva
      await executeQuery("UPDATE reservas SET estado = 'cancelada', notas = $1 WHERE id = $2", [
        motivo || null,
        reservaId,
      ])

      // Eliminar el préstamo temporal con etiqueta RESERVA si existe
      await executeQuery("DELETE FROM prestamos WHERE usuario_id = $1 AND libro_id = $2 AND notas = 'RESERVA'", [
        reserva.usuario_id,
        reserva.libro_id,
      ])

      // Devolver la copia al inventario
      await executeQuery("UPDATE libros SET copias_disponibles = copias_disponibles + 1 WHERE id = $1", [
        reserva.libro_id,
      ])

      // Confirmar transacción
      await executeQuery("COMMIT")

      return NextResponse.json({
        success: true,
        message: "Reserva cancelada con éxito",
      })
    } catch (error) {
      // Revertir transacción en caso de error
      await executeQuery("ROLLBACK")
      console.error("Error en la transacción, se ha revertido:", error)
      throw error
    }
  } catch (error) {
    console.error("Error al cancelar reserva:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
