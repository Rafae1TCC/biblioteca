import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

export async function GET() {
  try {
    // Verificar que el solicitante sea un administrador
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Actualizar roles para todos los usuarios con correo @uabc.edu.mx
    const result = await executeQuery(
      `UPDATE usuarios 
       SET rol = 'administrador' 
       WHERE email LIKE '%@uabc.edu.mx' 
       RETURNING id, email, rol`,
      [],
    )

    return NextResponse.json({
      success: true,
      message: `Se actualizaron ${result.length} usuarios con rol de administrador`,
      updatedUsers: result,
    })
  } catch (error) {
    console.error("Error actualizando roles:", error)
    return NextResponse.json({ error: "Error al actualizar roles" }, { status: 500 })
  }
}
