import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "El correo electrónico es obligatorio" }, { status: 400 })
    }

    // Verificar si el usuario existe
    const user = await executeQuery(
      `SELECT id, nombre FROM usuarios 
       WHERE email = $1 
       AND estado = 'activo'`,
      [email],
    )

    // No revelar si el usuario existe o no por seguridad
    if (user.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Si existe una cuenta con este correo, recibirás un enlace para restablecer tu contraseña.",
      })
    }

    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 1) // Token válido por 1 hora

    // Guardar token en la base de datos
    await executeQuery(
      `UPDATE usuarios 
       SET reset_token = $1, 
           reset_token_expiry = $2
       WHERE id = $3`,
      [resetToken, tokenExpiry.toISOString(), user[0].id],
    )

    // Enviar correo de restablecimiento
    await sendPasswordResetEmail(email, user[0].nombre, resetToken)

    return NextResponse.json({
      success: true,
      message: "Si existe una cuenta con este correo, recibirás un enlace para restablecer tu contraseña.",
    })
  } catch (error) {
    console.error("Error al procesar solicitud de recuperación:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud de recuperación de contraseña",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
