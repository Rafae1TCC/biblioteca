import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

export async function GET() {
  try {
    // Obtener la sesión actual
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        {
          error: "No hay sesión activa",
          message: "Debes iniciar sesión primero",
        },
        { status: 401 },
      )
    }

    const email = session.user.email
    const currentRole = session.user.role || "desconocido"

    // Verificar si el correo termina en @uabc.edu.mx
    const isUabcEmail = email.endsWith("@uabc.edu.mx")

    // Información de diagnóstico
    const diagnosticInfo = {
      email: email,
      currentRole: currentRole,
      isUabcEmail: isUabcEmail,
    }

    if (!isUabcEmail) {
      return NextResponse.json(
        {
          error: "Este endpoint solo funciona para correos @uabc.edu.mx",
          diagnosticInfo: diagnosticInfo,
        },
        { status: 403 },
      )
    }

    // Actualizar el rol del usuario actual a administrador
    await executeQuery(
      `UPDATE usuarios 
       SET rol = 'administrador' 
       WHERE email = $1`,
      [email],
    )

    // Verificar que el rol se haya actualizado correctamente
    const updatedUser = await executeQuery("SELECT id, email, rol FROM usuarios WHERE email = $1", [email])

    if (updatedUser.length === 0) {
      return NextResponse.json(
        {
          error: "No se encontró el usuario en la base de datos",
          diagnosticInfo: diagnosticInfo,
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message:
        "Rol actualizado a administrador. Por favor, cierra sesión y vuelve a iniciar para que los cambios surtan efecto.",
      before: diagnosticInfo,
      after: updatedUser[0],
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
