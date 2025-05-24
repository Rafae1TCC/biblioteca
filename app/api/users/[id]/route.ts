import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "administrador") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    // Obtener usuario por ID
    const users = await executeQuery("SELECT id, nombre, apellido, email, rol, estado FROM usuarios WHERE id = $1", [
      params.id,
    ])

    if (users.length === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return NextResponse.json({ message: "Error al obtener el usuario" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "administrador") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    // Obtener datos del cuerpo de la solicitud
    const { nombre, apellido, email, password, rol, estado } = await request.json()

    // Validar datos
    if (!nombre || !apellido || !email) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Verificar si el email ya existe (excepto para el usuario actual)
    const existingUsers = await executeQuery("SELECT id FROM usuarios WHERE email = $1 AND id != $2", [
      email,
      params.id,
    ])

    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "El email ya está registrado por otro usuario" }, { status: 400 })
    }

    // Construir la consulta SQL
    let query = `
      UPDATE usuarios 
      SET nombre = $1, apellido = $2, email = $3, rol = $4, estado = $5
    `
    const values = [nombre, apellido, email, rol || "usuario", estado || "activo"]

    // Si se proporciona una nueva contraseña, actualizarla
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      query += ", password = $6 WHERE id = $7"
      values.push(hashedPassword, params.id)
    } else {
      query += " WHERE id = $6"
      values.push(params.id)
    }

    // Actualizar el usuario
    await executeQuery(query, values)

    return NextResponse.json({ message: "Usuario actualizado exitosamente" })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json({ message: "Error al actualizar el usuario" }, { status: 500 })
  }
}
