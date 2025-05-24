import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token y contraseña son obligatorios" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
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

    // Generar hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Actualizar contraseña y limpiar token
    await executeQuery(
      `UPDATE usuarios 
       SET password_hash = $1, 
           reset_token = NULL, 
           reset_token_expiry = NULL
       WHERE id = $2`,
      [hashedPassword, user[0].id],
    )

    return NextResponse.json({
      success: true,
      message: "Contraseña restablecida correctamente",
    })
  } catch (error) {
    console.error("Error al restablecer contraseña:", error)
    return NextResponse.json(
      {
        error: "Error al restablecer la contraseña",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
