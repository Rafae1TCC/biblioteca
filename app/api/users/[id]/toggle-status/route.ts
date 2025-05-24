import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "administrador") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    // Obtener datos del cuerpo de la solicitud
    const { estado } = await request.json()

    if (estado !== "activo" && estado !== "inactivo") {
      return NextResponse.json({ message: "Estado inválido" }, { status: 400 })
    }

    // Verificar si es el último administrador activo
    if (estado === "inactivo") {
      const user = await executeQuery("SELECT rol FROM usuarios WHERE id = $1", [params.id])

      if (user.length > 0 && user[0].rol === "administrador") {
        const activeAdmins = await executeQuery(
          "SELECT COUNT(*) as count FROM usuarios WHERE rol = $1 AND estado = $2 AND id != $3",
          ["administrador", "activo", params.id],
        )

        if (activeAdmins[0].count === "0") {
          return NextResponse.json(
            { message: "No se puede desactivar al último administrador activo" },
            { status: 400 },
          )
        }
      }
    }

    // Actualizar el estado del usuario
    await executeQuery("UPDATE usuarios SET estado = $1 WHERE id = $2", [estado, params.id])

    return NextResponse.json({
      message: `Usuario ${estado === "activo" ? "activado" : "desactivado"} exitosamente`,
    })
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error)
    return NextResponse.json({ message: "Error al cambiar el estado del usuario" }, { status: 500 })
  }
}
