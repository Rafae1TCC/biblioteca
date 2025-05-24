import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Actualizar préstamos vencidos
    const updateQuery = `
      UPDATE prestamos 
      SET estado = 'vencido' 
      WHERE estado = 'activo' AND fecha_vencimiento < CURRENT_DATE
    `

    const result = await executeQuery(updateQuery)

    return NextResponse.json({
      message: "Préstamos vencidos actualizados correctamente",
      updated: result.rowCount || 0,
    })
  } catch (error) {
    console.error("Error al actualizar préstamos vencidos:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Error al actualizar préstamos vencidos",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
