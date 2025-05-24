import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { bookId } = await request.json()
    if (!bookId) {
      return NextResponse.json({ error: "ID del libro requerido" }, { status: 400 })
    }

    // Obtener el ID del usuario de la base de datos
    const users = await executeQuery(`SELECT id FROM usuarios WHERE email = $1`, [session.user.email])

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userId = users[0].id

    // Verificar si el libro ya está en la lista de deseos
    const existingItems = await executeQuery(`SELECT * FROM lista_deseos WHERE usuario_id = $1 AND libro_id = $2`, [
      userId,
      bookId,
    ])

    if (existingItems && existingItems.length > 0) {
      // Si ya existe, eliminarlo (toggle)
      await executeQuery(`DELETE FROM lista_deseos WHERE usuario_id = $1 AND libro_id = $2`, [userId, bookId])
      return NextResponse.json({ message: "Libro eliminado de la lista de deseos", added: false })
    } else {
      // Si no existe, añadirlo
      await executeQuery(`INSERT INTO lista_deseos (usuario_id, libro_id, fecha_agregado) VALUES ($1, $2, NOW())`, [
        userId,
        bookId,
      ])
      return NextResponse.json({ message: "Libro añadido a la lista de deseos", added: true })
    }
  } catch (error) {
    console.error("Error en la API de lista de deseos:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el ID del usuario de la base de datos
    const users = await executeQuery(`SELECT id FROM usuarios WHERE email = $1`, [session.user.email])

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userId = users[0].id

    // Obtener la lista de deseos del usuario con información del libro
    const wishlist = await executeQuery(
      `SELECT w.*, l.titulo, l.autor, l.imagen_portada, l.copias_disponibles
       FROM lista_deseos w
       JOIN libros l ON w.libro_id = l.id
       WHERE w.usuario_id = $1
       ORDER BY w.fecha_agregado DESC`,
      [userId],
    )

    return NextResponse.json({ wishlist })
  } catch (error) {
    console.error("Error al obtener la lista de deseos:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
