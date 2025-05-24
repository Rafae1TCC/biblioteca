import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`[API:loans:return:POST] Iniciando solicitud para préstamo ID=${params.id}`)

    const session = await getServerSession(authOptions)
    console.log("[API:loans:return:POST] Sesión:", session ? "Autenticado" : "No autenticado")

    if (!session?.user || session.user.role !== "administrador") {
      console.log("[API:loans:return:POST] Acceso denegado: Usuario no es administrador")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const loanId = params.id
    const { observaciones, extenderPrestamo, esReserva } = await request.json()

    console.log(
      `[API:loans:return:POST] Procesando ${esReserva ? "confirmación de reserva" : "devolución"} para préstamo ${loanId}`,
    )
    console.log(`[API:loans:return:POST] Parámetros: extenderPrestamo=${extenderPrestamo}, esReserva=${esReserva}`)

    // Obtener información del préstamo
    const loanResult = await executeQuery("SELECT * FROM prestamos WHERE id = $1", [loanId])
    console.log(
      "[API:loans:return:POST] Resultado consulta préstamo:",
      loanResult.length > 0 ? "Encontrado" : "No encontrado",
    )

    if (loanResult.length === 0) {
      return NextResponse.json({ error: "Préstamo no encontrado" }, { status: 404 })
    }

    const loan = loanResult[0]

    if (loan.estado !== "activo" && loan.estado !== "vencido") {
      console.log("[API:loans:return:POST] El préstamo ya ha sido devuelto o no está activo")
      return NextResponse.json(
        { error: "El préstamo ya ha sido devuelto o no está en un estado válido" },
        { status: 400 },
      )
    }

    // Iniciar transacción
    console.log("[API:loans:return:POST] Iniciando transacción")
    await executeQuery("BEGIN")

    try {
      if (esReserva) {
        // Si es una reserva, extender el préstamo a 14 días
        const nuevaFechaVencimiento = new Date()
        nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + 14)

        console.log(
          `[API:loans:return:POST] Convirtiendo reserva en préstamo regular con vencimiento: ${nuevaFechaVencimiento.toISOString()}`,
        )
        await executeQuery("UPDATE prestamos SET fecha_vencimiento = $1, notas = $2 WHERE id = $3", [
          nuevaFechaVencimiento.toISOString(),
          observaciones || null,
          loanId,
        ])

        console.log(`[API:loans:return:POST] Reserva ${loanId} convertida en préstamo regular`)
      } else if (extenderPrestamo) {
        // Si se extiende el préstamo, actualizar la fecha de vencimiento a 14 días desde hoy
        const nuevaFechaVencimiento = new Date()
        nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + 14)

        console.log(
          `[API:loans:return:POST] Extendiendo préstamo con nueva fecha de vencimiento: ${nuevaFechaVencimiento.toISOString()}`,
        )
        await executeQuery("UPDATE prestamos SET fecha_vencimiento = $1, estado = 'activo', notas = $2 WHERE id = $3", [
          nuevaFechaVencimiento.toISOString(),
          observaciones || loan.notas,
          loanId,
        ])

        console.log(`[API:loans:return:POST] Préstamo ${loanId} extendido correctamente`)
      } else {
        // Marcar el préstamo como devuelto
        console.log("[API:loans:return:POST] Marcando préstamo como devuelto")
        await executeQuery(
          "UPDATE prestamos SET estado = 'devuelto', fecha_devolucion = NOW(), notas = $1 WHERE id = $2",
          [observaciones || loan.notas, loanId],
        )

        // Actualizar disponibilidad del libro
        console.log(`[API:loans:return:POST] Actualizando disponibilidad del libro ID=${loan.libro_id}`)
        await executeQuery("UPDATE libros SET copias_disponibles = copias_disponibles + 1 WHERE id = $1", [
          loan.libro_id,
        ])

        console.log(
          `[API:loans:return:POST] Préstamo ${loanId} marcado como devuelto y libro ${loan.libro_id} actualizado`,
        )
      }

      // Confirmar transacción
      console.log("[API:loans:return:POST] Confirmando transacción")
      await executeQuery("COMMIT")
      console.log("[API:loans:return:POST] Transacción completada con éxito")

      return NextResponse.json({
        success: true,
        message: esReserva
          ? "Reserva convertida en préstamo regular"
          : extenderPrestamo
            ? "Préstamo extendido correctamente"
            : "Devolución registrada correctamente",
      })
    } catch (error) {
      // Revertir transacción en caso de error
      console.error("[API:loans:return:POST] Error en la transacción, revertiendo:", error)
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("[API:loans:return:POST] Error general:", error)

    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
