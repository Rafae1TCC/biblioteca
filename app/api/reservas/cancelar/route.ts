import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

// Mantenemos GET para compatibilidad, pero lo marcaremos como obsoleto
export async function GET(request: NextRequest) {
  console.warn(`[API:reservas:cancelar:GET] Método GET está obsoleto y será eliminado. Use POST en su lugar.`)
  return handleCancelacion(request)
}

// Agregamos soporte para POST como método preferido para mutaciones
export async function POST(request: NextRequest) {
  console.log(`[API:reservas:cancelar:POST] Iniciando proceso de cancelación de reserva`)
  return handleCancelacion(request)
}

// Función común para manejar la cancelación
async function handleCancelacion(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log(`[API:reservas:cancelar] Sesión de usuario verificada: ${session?.user?.email || "No autenticado"}`)

    if (!session?.user) {
      console.warn(`[API:reservas:cancelar] Intento de cancelación sin autenticación`)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const reservaId = request.nextUrl.searchParams.get("id")
    console.log(`[API:reservas:cancelar] ID de reserva a cancelar: ${reservaId}`)

    if (!reservaId) {
      console.warn(`[API:reservas:cancelar] No se proporcionó ID de reserva`)
      return NextResponse.json({ error: "ID de reserva no proporcionado" }, { status: 400 })
    }

    // Obtener el ID del usuario
    console.log(`[API:reservas:cancelar] Consultando ID de usuario para email: ${session.user.email}`)
    const userResult = await executeQuery("SELECT id FROM usuarios WHERE email = $1", [session.user.email])

    if (userResult.length === 0) {
      console.error(`[API:reservas:cancelar] Usuario no encontrado para ${session.user.email}`)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userId = userResult[0].id
    console.log(`[API:reservas:cancelar] ID de usuario encontrado: ${userId}`)

    // Verificar que la reserva pertenezca al usuario
    console.log(`[API:reservas:cancelar] Verificando que la reserva ${reservaId} pertenezca al usuario ${userId}`)
    const reservaResult = await executeQuery("SELECT * FROM reservas WHERE id = $1 AND usuario_id = $2", [
      reservaId,
      userId,
    ])

    if (reservaResult.length === 0) {
      console.warn(`[API:reservas:cancelar] La reserva ${reservaId} no pertenece al usuario ${userId}`)
      return NextResponse.json({ error: "Reserva no encontrada o no pertenece al usuario" }, { status: 404 })
    }

    const reserva = reservaResult[0]
    console.log(`[API:reservas:cancelar] Reserva encontrada: ${JSON.stringify(reserva)}`)

    // Iniciar transacción
    console.log(`[API:reservas:cancelar] Iniciando transacción de base de datos`)
    await executeQuery("BEGIN")

    try {
      // Actualizar estado de la reserva
      console.log(`[API:reservas:cancelar] Actualizando estado de la reserva ${reservaId} a 'cancelada'`)
      await executeQuery("UPDATE reservas SET estado = 'cancelada' WHERE id = $1", [reservaId])

      // Devolver la copia al inventario
      console.log(`[API:reservas:cancelar] Devolviendo copia al inventario para libro ${reserva.libro_id}`)
      await executeQuery("UPDATE libros SET copias_disponibles = copias_disponibles + 1 WHERE id = $1", [
        reserva.libro_id,
      ])

      // Confirmar transacción
      console.log(`[API:reservas:cancelar] Confirmando transacción`)
      await executeQuery("COMMIT")
      console.log(`[API:reservas:cancelar] Transacción completada con éxito`)
    } catch (error) {
      // Revertir transacción en caso de error
      console.error(`[API:reservas:cancelar] Error en la transacción, revirtiendo:`, error)
      await executeQuery("ROLLBACK")
      console.log(`[API:reservas:cancelar] Transacción revertida`)
      return NextResponse.json({ error: "Error al cancelar la reserva" }, { status: 500 })
    }

    // Devolver respuesta JSON en lugar de redireccionar
    return NextResponse.json({
      success: true,
      message: "Reserva cancelada exitosamente",
    })
  } catch (error) {
    console.error(`[API:reservas:cancelar] Error al cancelar reserva:`, error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
