import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 400 })
    }

    // Verificar si el token existe y no ha expirado
    const currentDate = new Date().toISOString()
    const user = await executeQuery(
      `SELECT id FROM usuarios 
       WHERE reset_token = $1 
       AND reset_token_expiry > $2
       AND estado = 'activo'`,
      [token, currentDate],
    )

    if (user.length === 0) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
    })
  } catch (error) {
    console.error("Error al verificar token de restablecimiento:", error)
    return NextResponse.json(
      {
        error: "Error al verificar token",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
