import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el email del usuario actual
    const email = session.user.email

    if (!email) {
      return NextResponse.json({ error: "No hay email en la sesión" }, { status: 400 })
    }

    // Verificar si el usuario existe en la base de datos
    const user = await executeQuery("SELECT * FROM usuarios WHERE email = $1", [email])

    if (user.length === 0) {
      return NextResponse.json({
        exists: false,
        message: "El usuario no existe en la base de datos",
        session: {
          email: session.user.email,
          name: session.user.name,
          id: session.user.id,
          role: session.user.role,
        },
      })
    }

    // Devolver información del usuario
    return NextResponse.json({
      exists: true,
      user: user[0],
      session: {
        email: session.user.email,
        name: session.user.name,
        id: session.user.id,
        role: session.user.role,
      },
    })
  } catch (error) {
    console.error("Error verificando usuario:", error)
    return NextResponse.json({ error: "Error al verificar el usuario" }, { status: 500 })
  }
}
