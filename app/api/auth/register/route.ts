import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { nombre, apellido, email, password } = await request.json()

    // Validaciones básicas
    if (!nombre || !apellido || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    // Verificar si el correo ya existe
    const existingUser = await executeQuery("SELECT * FROM usuarios WHERE email = $1", [email])

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Este correo electrónico ya está registrado" }, { status: 400 })
    }

    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Token válido por 24 horas

    // Insertar usuario en la base de datos
    const result = await executeQuery(
      `INSERT INTO usuarios 
       (nombre, apellido, email, password_hash, rol, estado, fecha_registro, verification_token, token_expiry) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8)
       RETURNING id`,
      [
        nombre,
        apellido,
        email,
        hashedPassword,
        email.endsWith("@uabc.edu.mx") ? "administrador" : "usuario",
        "pendiente", // Estado pendiente hasta que verifique el correo
        verificationToken,
        tokenExpiry.toISOString(),
      ],
    )

    if (!result || result.length === 0) {
      throw new Error("No se pudo insertar el usuario en la base de datos")
    }

    // Enviar correo de verificación
    await sendVerificationEmail(email, nombre, verificationToken)

    return NextResponse.json({
      success: true,
      message: "Usuario registrado correctamente. Por favor verifica tu correo electrónico.",
    })
  } catch (error) {
    console.error("Error en el registro:", error)
    return NextResponse.json(
      {
        error: "Error al registrar usuario",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
