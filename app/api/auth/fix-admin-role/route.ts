import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

export async function GET(request: Request) {
  try {
    // Obtener la sesión actual
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 })
    }

    const email = session.user.email

    // Verificar si el correo termina en @uabc.edu.mx
    if (!email.endsWith("@uabc.edu.mx")) {
      return NextResponse.json(
        {
          error: "Este endpoint solo funciona para correos @uabc.edu.mx",
          currentEmail: email,
        },
        { status: 403 },
      )
    }

    // Actualizar el rol del usuario actual a administrador
    const result = await executeQuery(
      `UPDATE usuarios 
       SET rol = 'administrador' 
       WHERE email = $1 
       RETURNING id, email, rol`,
      [email],
    )

    if (result.length === 0) {
      return NextResponse.json(
        {
          error: "No se encontró el usuario en la base de datos",
          email: email,
        },
        { status: 404 },
      )
    }

    // Forzar la actualización del token JWT
    // Nota: Esto no actualiza el token inmediatamente, el usuario deberá cerrar sesión y volver a iniciar

    return NextResponse.json({
      success: true,
      message:
        "Rol actualizado a administrador. Por favor, cierra sesión y vuelve a iniciar para que los cambios surtan efecto.",
      user: result[0],
    })
  } catch (error) {
    console.error("Error actualizando rol:", error)
    return NextResponse.json(
      {
        error: "Error al actualizar el rol",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
