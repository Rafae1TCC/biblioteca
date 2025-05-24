import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el ID del usuario de la base de datos
    const users = await executeQuery(`SELECT id FROM usuarios WHERE email = $1`, [session.user.email])

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userId = users[0].id

    // Obtener estadísticas de préstamos
    const loanStats = await executeQuery(
      `SELECT 
    COUNT(*) FILTER (WHERE estado = 'activo' AND (notas IS NULL OR notas != 'RESERVA')) AS active_loans,
    COUNT(*) FILTER (WHERE estado = 'activo' AND notas = 'RESERVA') AS active_reservations,
    COUNT(*) FILTER (WHERE estado = 'devuelto') AS returned_loans,
    COUNT(*) FILTER (WHERE estado = 'vencido') AS overdue_loans
   FROM prestamos 
   WHERE usuario_id = $1`,
      [userId],
    )

    // Obtener cantidad de libros en lista de deseos
    const wishlistCount = await executeQuery(
      `SELECT COUNT(*) AS wishlist_count
       FROM lista_deseos
       WHERE usuario_id = $1`,
      [userId],
    )

    const stats = {
      activeLoans: Number.parseInt(loanStats[0].active_loans) || 0,
      activeReservations: Number.parseInt(loanStats[0].active_reservations) || 0,
      returnedLoans: Number.parseInt(loanStats[0].returned_loans) || 0,
      overdueLoans: Number.parseInt(loanStats[0].overdue_loans) || 0,
      wishlistCount: Number.parseInt(wishlistCount[0].wishlist_count) || 0,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error al obtener estadísticas del usuario:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
