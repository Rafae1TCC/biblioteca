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
      `SELECT id, email FROM usuarios 
       WHERE verification_token = $1 
       AND token_expiry > $2
       AND estado = 'pendiente'`,
      [token, currentDate],
    )

    if (user.length === 0) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    // Actualizar estado del usuario a activo
    await executeQuery(
      `UPDATE usuarios 
       SET estado = 'activo', 
           verification_token = NULL, 
           token_expiry = NULL,
           email_verified = true
       WHERE id = $1`,
      [user[0].id],
    )

    // Redirigir a la página de login con mensaje de éxito
    return NextResponse.redirect(new URL("/login?verified=true", request.url))
  } catch (error) {
    console.error("Error en la verificación de correo:", error)
    return NextResponse.json(
      {
        error: "Error al verificar el correo electrónico",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
