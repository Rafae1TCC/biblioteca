import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { libroId } = await request.json()

    if (!libroId) {
      return NextResponse.json({ error: "ID del libro requerido" }, { status: 400 })
    }

    // Obtener el ID del usuario
    const userResult = await executeQuery("SELECT id FROM usuarios WHERE email = $1", [session.user.email])

    if (userResult.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userId = userResult[0].id

    // Verificar si el libro existe
    const bookResult = await executeQuery("SELECT id FROM libros WHERE id = $1", [libroId])

    if (bookResult.length === 0) {
      return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 })
    }

    // Verificar si ya está en la lista de deseos
    const existingWishlist = await executeQuery("SELECT * FROM lista_deseos WHERE usuario_id = $1 AND libro_id = $2", [
      userId,
      libroId,
    ])

    if (existingWishlist.length > 0) {
      // Si ya existe, lo eliminamos
      await executeQuery("DELETE FROM lista_deseos WHERE usuario_id = $1 AND libro_id = $2", [userId, libroId])
      return NextResponse.json({
        success: true,
        message: "Libro eliminado de la lista de deseos",
        action: "removed",
      })
    } else {
      // Si no existe, lo añadimos
      await executeQuery("INSERT INTO lista_deseos (usuario_id, libro_id, fecha_agregado) VALUES ($1, $2, NOW())", [
        userId,
        libroId,
      ])
      return NextResponse.json({
        success: true,
        message: "Libro añadido a la lista de deseos",
        action: "added",
      })
    }
  } catch (error) {
    console.error("Error al gestionar la lista de deseos:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { libroId } = await request.json()

    if (!libroId) {
      return NextResponse.json({ error: "ID del libro requerido" }, { status: 400 })
    }

    // Obtener el ID del usuario
    const userResult = await executeQuery("SELECT id FROM usuarios WHERE email = $1", [session.user.email])

    if (userResult.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userId = userResult[0].id

    // Eliminar de la lista de deseos
    await executeQuery("DELETE FROM lista_deseos WHERE usuario_id = $1 AND libro_id = $2", [userId, libroId])

    return NextResponse.json({
      success: true,
      message: "Libro eliminado de la lista de deseos",
      action: "removed",
    })
  } catch (error) {
    console.error("Error al eliminar de la lista de deseos:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
