import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    // Obtener la sesión actual
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({
        status: "unauthenticated",
        message: "No hay sesión activa",
      })
    }

    // Información básica de la sesión
    const sessionInfo = {
      user: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        id: session.user.id,
      },
      expires: session.expires,
    }

    // Si hay un email, verificar información en la base de datos
    let dbInfo = null
    if (session.user.email) {
      const dbUser = await executeQuery(
        "SELECT id, nombre, apellido, email, rol, estado FROM usuarios WHERE email = $1",
        [session.user.email],
      )

      if (dbUser.length > 0) {
        dbInfo = dbUser[0]
      }
    }

    return NextResponse.json({
      status: "authenticated",
      session: sessionInfo,
      database: dbInfo,
      isUabcEmail: session.user.email?.endsWith("@uabc.edu.mx") || false,
      isAdmin: session.user.role === "administrador",
    })
  } catch (error) {
    console.error("Error obteniendo información de sesión:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
