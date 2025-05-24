import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// Modificar la función GET para incluir logging detallado

export async function GET() {
  console.log(`[API:reservas:cancelar-vencidas:GET] Iniciando proceso de cancelación de reservas vencidas`)
  try {
    // Obtener reservas vencidas (más de 1 día)
    console.log(`[API:reservas:cancelar-vencidas:GET] Consultando reservas vencidas (más de 1 día)`)
    const reservasVencidas = await executeQuery(
      `SELECT r.id, r.libro_id
       FROM reservas r
       WHERE r.estado = 'pendiente' AND r.fecha_reserva < NOW() - INTERVAL '1 day'`,
    )

    console.log(`[API:reservas:cancelar-vencidas:GET] Encontradas ${reservasVencidas.length} reservas vencidas`)

    if (reservasVencidas.length === 0) {
      console.log(`[API:reservas:cancelar-vencidas:GET] No hay reservas vencidas para cancelar`)
      return NextResponse.json({ message: "No hay reservas vencidas para cancelar" })
    }

    // Iniciar transacción
    console.log(`[API:reservas:cancelar-vencidas:GET] Iniciando transacción de base de datos`)
    await executeQuery("BEGIN")

    try {
      let canceladas = 0

      for (const reserva of reservasVencidas) {
        console.log(
          `[API:reservas:cancelar-vencidas:GET] Procesando reserva vencida ID: ${reserva.id} para libro ID: ${reserva.libro_id}`,
        )

        // Actualizar estado de la reserva
        console.log(
          `[API:reservas:cancelar-vencidas:GET] Actualizando estado de la reserva ${reserva.id} a 'cancelada'`,
        )
        await executeQuery("UPDATE reservas SET estado = 'cancelada' WHERE id = $1", [reserva.id])

        // Devolver la copia al inventario
        console.log(
          `[API:reservas:cancelar-vencidas:GET] Devolviendo copia al inventario para libro ${reserva.libro_id}`,
        )
        await executeQuery("UPDATE libros SET copias_disponibles = copias_disponibles + 1 WHERE id = $1", [
          reserva.libro_id,
        ])

        canceladas++
        console.log(`[API:reservas:cancelar-vencidas:GET] Reserva ${reserva.id} cancelada exitosamente`)
      }

      // Confirmar transacción
      console.log(`[API:reservas:cancelar-vencidas:GET] Confirmando transacción`)
      await executeQuery("COMMIT")
      console.log(`[API:reservas:cancelar-vencidas:GET] Transacción completada con éxito. Canceladas: ${canceladas}`)

      return NextResponse.json({
        success: true,
        message: `Se han cancelado ${canceladas} reservas vencidas`,
        canceladas,
      })
    } catch (error) {
      // Revertir transacción en caso de error
      console.error(`[API:reservas:cancelar-vencidas:GET] Error al cancelar reservas vencidas:`, error)
      await executeQuery("ROLLBACK")
      console.log(`[API:reservas:cancelar-vencidas:GET] Transacción revertida`)
      throw error
    }
  } catch (error) {
    console.error(`[API:reservas:cancelar-vencidas:GET] Error al procesar la solicitud:`, error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
