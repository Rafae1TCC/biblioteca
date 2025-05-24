import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener datos del usuario actual
    const { email, name, image } = session.user

    if (!email) {
      return NextResponse.json({ error: "No hay email en la sesión" }, { status: 400 })
    }

    // Determinar el rol basado en el dominio de correo
    const role = email.endsWith("@uabc.edu.mx") ? "administrador" : "usuario"

    // Dividir el nombre completo en nombre y apellido
    const firstName = name?.split(" ")[0] || ""
    const lastName = name?.split(" ").slice(1).join(" ") || ""

    // Verificar si el usuario existe en la base de datos
    const existingUser = await executeQuery("SELECT * FROM usuarios WHERE email = $1", [email])

    let result

    if (existingUser.length === 0) {
      // Crear nuevo usuario
      result = await executeQuery(
        `INSERT INTO usuarios 
         (nombre, apellido, email, imagen_perfil, rol, estado, fecha_registro) 
         VALUES ($1, $2, $3, $4, $5, 'activo', NOW())
         RETURNING id`,
        [firstName, lastName, email, image || "", role],
      )

      return NextResponse.json({
        success: true,
        action: "created",
        userId: result[0]?.id,
      })
    } else {
      // Actualizar usuario existente
      result = await executeQuery(
        `UPDATE usuarios 
         SET nombre = $1, 
             apellido = $2, 
             imagen_perfil = $3,
             rol = $4,
             estado = 'activo'
         WHERE email = $5
         RETURNING id`,
        [firstName, lastName, image || "", role, email],
      )

      return NextResponse.json({
        success: true,
        action: "updated",
        userId: result[0]?.id,
      })
    }
  } catch (error) {
    console.error("Error sincronizando usuario:", error)
    return NextResponse.json({ error: "Error al sincronizar el usuario" }, { status: 500 })
  }
}
