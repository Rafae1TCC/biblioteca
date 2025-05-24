import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "El correo electrónico es obligatorio" }, { status: 400 })
    }

    // Verificar si el usuario existe y está pendiente de verificación
    const user = await executeQuery(
      `SELECT id, nombre FROM usuarios 
       WHERE email = $1 
       AND estado = 'pendiente'`,
      [email],
    )

    if (user.length === 0) {
      return NextResponse.json(
        { error: "No se encontró un usuario pendiente de verificación con este correo electrónico" },
        { status: 404 },
      )
    }

    // Generar nuevo token de verificación
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Token válido por 24 horas

    // Actualizar token de verificación
    await executeQuery(
      `UPDATE usuarios 
       SET verification_token = $1, 
           token_expiry = $2
       WHERE id = $3`,
      [verificationToken, tokenExpiry.toISOString(), user[0].id],
    )

    // Enviar correo de verificación
    await sendVerificationEmail(email, user[0].nombre, verificationToken)

    return NextResponse.json({
      success: true,
      message: "Correo de verificación reenviado correctamente.",
    })
  } catch (error) {
    console.error("Error al reenviar verificación:", error)
    return NextResponse.json(
      {
        error: "Error al reenviar el correo de verificación",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
