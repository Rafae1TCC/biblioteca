import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el ID del usuario
    const userResult = await executeQuery("SELECT id FROM usuarios WHERE email = $1", [session.user.email])

    if (userResult.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userId = userResult[0].id

    // Obtener préstamos activos (excluyendo reservas)
    const activeLoansResult = await executeQuery(
      "SELECT COUNT(*) FROM prestamos WHERE usuario_id = $1 AND estado = 'activo' AND (notas IS NULL OR notas != 'RESERVA')",
      [userId],
    )
    const activeLoans = Number.parseInt(activeLoansResult[0].count) || 0

    // Obtener reservas activas
    const reservationsResult = await executeQuery(
      "SELECT COUNT(*) FROM prestamos WHERE usuario_id = $1 AND estado = 'activo' AND notas = 'RESERVA'",
      [userId],
    )
    const reservations = Number.parseInt(reservationsResult[0].count) || 0

    // Obtener préstamos vencidos
    const overdueLoansResult = await executeQuery(
      "SELECT COUNT(*) FROM prestamos WHERE usuario_id = $1 AND estado = 'vencido'",
      [userId],
    )
    const overdueLoans = Number.parseInt(overdueLoansResult[0].count) || 0

    // Obtener cantidad de libros en lista de deseos
    const wishlistItemsResult = await executeQuery("SELECT COUNT(*) FROM lista_deseos WHERE usuario_id = $1", [userId])
    const wishlistItems = Number.parseInt(wishlistItemsResult[0].count) || 0

    return NextResponse.json({
      activeLoans,
      reservations,
      overdueLoans,
      wishlistItems,
    })
  } catch (error) {
    console.error("Error al obtener estadísticas del usuario:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
